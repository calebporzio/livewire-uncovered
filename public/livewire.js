document.querySelectorAll('[wire\\:snapshot]').forEach(el => {
    el.__livewire = JSON.parse(el.getAttribute('wire:snapshot'))

    initWireClick(el)
})

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

        el.innerHTML = html
    })
}
