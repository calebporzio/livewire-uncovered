document.querySelectorAll('[wire\\:snapshot]').forEach(el => {
    el.__livewire = JSON.parse(el.getAttribute('wire:snapshot'))

    initWireClick(el)
    initWireModel(el)
})

function initWireModel(el) {
    updateWireModelInputs(el)

    let data = el.__livewire.data

    el.addEventListener('change', e => {
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

        Alpine.morph(el.firstElementChild, html)

        updateWireModelInputs(el)
    })
}
