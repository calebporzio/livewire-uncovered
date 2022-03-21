(() => {
    // packages/morph/src/dom.js
    var DomManager = class {
      el = void 0;
      constructor(el) {
        this.el = el;
      }
      traversals = {
        first: "firstElementChild",
        next: "nextElementSibling",
        parent: "parentElement"
      };
      nodes() {
        this.traversals = {
          first: "firstChild",
          next: "nextSibling",
          parent: "parentNode"
        };
        return this;
      }
      first() {
        return this.teleportTo(this.el[this.traversals["first"]]);
      }
      next() {
        return this.teleportTo(this.teleportBack(this.el[this.traversals["next"]]));
      }
      before(insertee) {
        this.el[this.traversals["parent"]].insertBefore(insertee, this.el);
        return insertee;
      }
      replace(replacement) {
        this.el[this.traversals["parent"]].replaceChild(replacement, this.el);
        return replacement;
      }
      append(appendee) {
        this.el.appendChild(appendee);
        return appendee;
      }
      teleportTo(el) {
        if (!el)
          return el;
        if (el._x_teleport)
          return el._x_teleport;
        return el;
      }
      teleportBack(el) {
        if (!el)
          return el;
        if (el._x_teleportBack)
          return el._x_teleportBack;
        return el;
      }
    };
    function dom(el) {
      return new DomManager(el);
    }
    function createElement(html) {
      return document.createRange().createContextualFragment(html).firstElementChild;
    }
    function textOrComment(el) {
      return el.nodeType === 3 || el.nodeType === 8;
    }
  
    // packages/morph/src/morph.js
    var resolveStep = () => {
    };
    var logger = () => {
    };
    async function morph(from, toHtml, options) {
      let fromEl;
      let toEl;
      let key, lookahead, updating, updated, removing, removed, adding, added, debug;
      function breakpoint(message) {
        if (!debug)
          return;
        logger((message || "").replace("\n", "\\n"), fromEl, toEl);
        return new Promise((resolve) => resolveStep = () => resolve());
      }
      function assignOptions(options2 = {}) {
        let defaultGetKey = (el) => el.getAttribute("key");
        let noop = () => {
        };
        updating = options2.updating || noop;
        updated = options2.updated || noop;
        removing = options2.removing || noop;
        removed = options2.removed || noop;
        adding = options2.adding || noop;
        added = options2.added || noop;
        key = options2.key || defaultGetKey;
        lookahead = options2.lookahead || false;
        debug = options2.debug || false;
      }
      async function patch(from2, to) {
        if (differentElementNamesTypesOrKeys(from2, to)) {
          let result = patchElement(from2, to);
          await breakpoint("Swap elements");
          return result;
        }
        let updateChildrenOnly = false;
        if (shouldSkip(updating, from2, to, () => updateChildrenOnly = true))
          return;
        window.Alpine && initializeAlpineOnTo(from2, to, () => updateChildrenOnly = true);
        if (textOrComment(to)) {
          await patchNodeValue(from2, to);
          updated(from2, to);
          return;
        }
        if (!updateChildrenOnly) {
          await patchAttributes(from2, to);
        }
        updated(from2, to);
        await patchChildren(from2, to);
      }
      function differentElementNamesTypesOrKeys(from2, to) {
        return from2.nodeType != to.nodeType || from2.nodeName != to.nodeName || getKey(from2) != getKey(to);
      }
      function patchElement(from2, to) {
        if (shouldSkip(removing, from2))
          return;
        let toCloned = to.cloneNode(true);
        if (shouldSkip(adding, toCloned))
          return;
        dom(from2).replace(toCloned);
        removed(from2);
        added(toCloned);
      }
      async function patchNodeValue(from2, to) {
        let value = to.nodeValue;
        if (from2.nodeValue !== value) {
          from2.nodeValue = value;
          await breakpoint("Change text node to: " + value);
        }
      }
      async function patchAttributes(from2, to) {
        if (from2._x_isShown && !to._x_isShown) {
          return;
        }
        if (!from2._x_isShown && to._x_isShown) {
          return;
        }
        let domAttributes = Array.from(from2.attributes);
        let toAttributes = Array.from(to.attributes);
        for (let i = domAttributes.length - 1; i >= 0; i--) {
          let name = domAttributes[i].name;
          if (!to.hasAttribute(name)) {
            from2.removeAttribute(name);
            await breakpoint("Remove attribute");
          }
        }
        for (let i = toAttributes.length - 1; i >= 0; i--) {
          let name = toAttributes[i].name;
          let value = toAttributes[i].value;
          if (from2.getAttribute(name) !== value) {
            from2.setAttribute(name, value);
            await breakpoint(`Set [${name}] attribute to: "${value}"`);
          }
        }
      }
      async function patchChildren(from2, to) {
        let domChildren = from2.childNodes;
        let toChildren = to.childNodes;
        let toKeyToNodeMap = keyToMap(toChildren);
        let domKeyDomNodeMap = keyToMap(domChildren);
        let currentTo = dom(to).nodes().first();
        let currentFrom = dom(from2).nodes().first();
        let domKeyHoldovers = {};
        while (currentTo) {
          let toKey = getKey(currentTo);
          let domKey = getKey(currentFrom);
          if (!currentFrom) {
            if (toKey && domKeyHoldovers[toKey]) {
              let holdover = domKeyHoldovers[toKey];
              dom(from2).append(holdover);
              currentFrom = holdover;
              await breakpoint("Add element (from key)");
            } else {
              let added2 = addNodeTo(currentTo, from2) || {};
              await breakpoint("Add element: " + (added2.outerHTML || added2.nodeValue));
              currentTo = dom(currentTo).nodes().next();
              continue;
            }
          }
          if (lookahead) {
            let nextToElementSibling = dom(currentTo).next();
            let found = false;
            while (!found && nextToElementSibling) {
              if (currentFrom.isEqualNode(nextToElementSibling)) {
                found = true;
                currentFrom = addNodeBefore(currentTo, currentFrom);
                domKey = getKey(currentFrom);
                await breakpoint("Move element (lookahead)");
              }
              nextToElementSibling = dom(nextToElementSibling).next();
            }
          }
          if (toKey !== domKey) {
            if (!toKey && domKey) {
              domKeyHoldovers[domKey] = currentFrom;
              currentFrom = addNodeBefore(currentTo, currentFrom);
              domKeyHoldovers[domKey].remove();
              currentFrom = dom(currentFrom).nodes().next();
              currentTo = dom(currentTo).nodes().next();
              await breakpoint('No "to" key');
              continue;
            }
            if (toKey && !domKey) {
              if (domKeyDomNodeMap[toKey]) {
                currentFrom = dom(currentFrom).replace(domKeyDomNodeMap[toKey]);
                await breakpoint('No "from" key');
              }
            }
            if (toKey && domKey) {
              domKeyHoldovers[domKey] = currentFrom;
              let domKeyNode = domKeyDomNodeMap[toKey];
              if (domKeyNode) {
                currentFrom = dom(currentFrom).replace(domKeyNode);
                await breakpoint('Move "from" key');
              } else {
                domKeyHoldovers[domKey] = currentFrom;
                currentFrom = addNodeBefore(currentTo, currentFrom);
                domKeyHoldovers[domKey].remove();
                currentFrom = dom(currentFrom).next();
                currentTo = dom(currentTo).next();
                await breakpoint("Swap elements with keys");
                continue;
              }
            }
          }
          let currentFromNext = currentFrom && dom(currentFrom).nodes().next();
          await patch(currentFrom, currentTo);
          currentTo = currentTo && dom(currentTo).nodes().next();
          currentFrom = currentFromNext;
        }
        let removals = [];
        while (currentFrom) {
          if (!shouldSkip(removing, currentFrom))
            removals.push(currentFrom);
          currentFrom = dom(currentFrom).nodes().next();
        }
        while (removals.length) {
          let domForRemoval = removals.shift();
          domForRemoval.remove();
          await breakpoint("remove el");
          removed(domForRemoval);
        }
      }
      function getKey(el) {
        return el && el.nodeType === 1 && key(el);
      }
      function keyToMap(els) {
        let map = {};
        els.forEach((el) => {
          let theKey = getKey(el);
          if (theKey) {
            map[theKey] = el;
          }
        });
        return map;
      }
      function addNodeTo(node, parent) {
        if (!shouldSkip(adding, node)) {
          let clone = node.cloneNode(true);
          dom(parent).append(clone);
          added(clone);
          return clone;
        }
        return null;
      }
      function addNodeBefore(node, beforeMe) {
        if (!shouldSkip(adding, node)) {
          let clone = node.cloneNode(true);
          dom(beforeMe).before(clone);
          added(clone);
          return clone;
        }
        return beforeMe;
      }
      assignOptions(options);
      fromEl = from;
      toEl = createElement(toHtml);
      if (window.Alpine && window.Alpine.closestDataStack && !from._x_dataStack) {
        toEl._x_dataStack = window.Alpine.closestDataStack(from);
        toEl._x_dataStack && window.Alpine.clone(from, toEl);
      }
      await breakpoint();
      await patch(from, toEl);
      fromEl = void 0;
      toEl = void 0;
      return from;
    }
    morph.step = () => resolveStep();
    morph.log = (theLogger) => {
      logger = theLogger;
    };
    function shouldSkip(hook, ...args) {
      let skip = false;
      hook(...args, () => skip = true);
      return skip;
    }
    function initializeAlpineOnTo(from, to, childrenOnly) {
      if (from.nodeType !== 1)
        return;
      if (from._x_dataStack) {
        window.Alpine.clone(from, to);
      }
    }
  
    // packages/morph/src/index.js
    function src_default(Alpine) {
      Alpine.morph = morph;
    }

    window.morph = morph
  
    // packages/morph/builds/cdn.js
    document.addEventListener("alpine:init", () => {
      window.Alpine.plugin(src_default);
    });
  })();
