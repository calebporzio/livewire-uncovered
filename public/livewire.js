document.querySelectorAll('[wire\\:snapshot]').forEach(el => {
    el.__livewire = JSON.parse(el.getAttribute('wire:snapshot'))

    initWireClick(el)
    initWireModel(el)
})

function initWireModel(el) {
    updateWireModelInputs(el)

    let data = el.__livewire.data

    el.addEventListener('input', e => {
        if (! e.target.hasAttribute('wire:model')) return

        let property = e.target.getAttribute('wire:model')
        let value = e.target.value

        sendRequest(el, { updateProperty: [property, value] })
    })
}

function updateWireModelInputs(el) {
    let data = el.__livewire.data

    el.querySelectorAll('[wire\\:model]').forEach(i => {
        let property = i.getAttribute('wire:model')

        i.value = data[property]
    })
}

function initWireClick(el) {
    el.addEventListener('click', e => {
        if (! e.target.hasAttribute('wire:click')) return

        let method = e.target.getAttribute('wire:click')

        sendRequest(el, { callMethod: method })
    })
}

function sendRequest(el, addToPayload) {
    let snapshot = el.__livewire

    fetch('/livewire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            snapshot,
            ...addToPayload,
        })
    }).then(i => i.json()).then(response => {
        let { html, snapshot } = response

        el.__livewire = snapshot

        morph(el.firstElementChild, html)

        updateWireModelInputs(el)
    })
}

function morph(from, to) {
    if (typeof to === 'string') {
        let temp = document.createElement('div')
        temp.innerHTML = to
        to = temp.firstElementChild
    }

    if (from.tagName !== to.tagName) {
        from.replaceWith(to.cloneNode(true))
        return
    }

    patchText(from, to)
    patchAttributes(from, to)
    patchChildren(from, to)
}

function patchChildren(from, to) {
    let childFrom = from.firstElementChild
    let childTo = to.firstElementChild

    while (childTo) {
        if (! childFrom) {
            childFrom = from.appendChild(childTo.cloneNode(true))
        } else {
            morph(childFrom, childTo)
        }

        childFrom = childFrom.nextElementSibling
        childTo = childTo.nextElementSibling
    }

    while (childFrom) {
        let toRemove = childFrom
        childFrom = childFrom.nextElementSibling
        toRemove.remove()
    }
}

function patchAttributes(from, to) {
    for (let { name, value } of to.attributes) {
        from.setAttribute(name, value)
    }

    for (let { name, value } of from.attributes) {
        if (! to.hasAttribute(name, value)) {
            from.removeAttribute(name)
        }
    }
}

function patchText(from, to) {
    if (to.children.length > 0) return

    from.textContent = to.textContent
}
