document.querySelectorAll('[wire\\:snapshot]').forEach(el => {
    let snapshot = JSON.parse(el.getAttribute('wire:snapshot'))

    el.__livewireSnapshot = snapshot

    hideWireLoadings(el)
    initWireClick(el)
    initWireModel(el)
})

function initWireClick(el) {
    refreshWireModels(el)

    el.addEventListener('click', e => {
        if (! e.target.hasAttribute('wire:click')) return

        let method = e.target.getAttribute('wire:click')

        sendRequest(el, { callMethod: method })
    })
}

function initWireModel(el) {
    el.addEventListener('input', e => {
        if (! e.target.hasAttribute('wire:model')) return

        let property = e.target.getAttribute('wire:model')
        let value = e.target.value

        sendRequest(el, { updateProperty: [property, value] })
    })
}

function hideWireLoadings(el) {
    el.querySelectorAll('[wire\\:loading]').forEach(i => i.style.display = 'none')
    el.querySelectorAll('[wire\\:loading\\.remove]').forEach(i => i.style.display = '')
}

function showWireLoadings(el) {
    el.querySelectorAll('[wire\\:loading]').forEach(i => i.style.display = '')
    el.querySelectorAll('[wire\\:loading\\.remove]').forEach(i => i.style.display = 'none')
}

function sendRequest(el, addedToPayload, callback = () => {}) {
        let snapshot = el.__livewireSnapshot

        showWireLoadings(el)

        fetch('/livewire', {
            method: 'POST',
            body: JSON.stringify({ snapshot, ...addedToPayload }),
            headers: { 'Content-Type': 'application/json' }
        }).then(i => i.json()).then(async response => {
            el.__livewireSnapshot = response.snapshot

            await Alpine.morph(el.firstElementChild, response.html)

            refreshWireModels(el)

            hideWireLoadings(el)

            callback()
        })
}

function refreshWireModels(el) {
    let data = el.__livewireSnapshot.data

    el.querySelectorAll('[wire\\:model]').forEach(i => {
        let property = i.getAttribute('wire:model')

        i.value = data[property]
    })
}
