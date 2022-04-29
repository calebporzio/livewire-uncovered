<html>
    <link href="/app.css" rel="stylesheet">

    @livewire(App\Http\Livewire\Counter::class)

    <script>
        document.querySelectorAll('[wire\\:snapshot]').forEach(el => {
            let snapshot = JSON.parse(el.getAttribute('wire:snapshot'))

            el.addEventListener('click', e => {
                if (! e.target.hasAttribute('wire:click')) return

                let method = e.target.getAttribute('wire:click')

                fetch('/livewire', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        snapshot,
                        callMethod: method,
                    })
                })
            })
        })
    </script>
</html>
