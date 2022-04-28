<html>
    <link href="/app.css" rel="stylesheet">

    @livewire(App\Http\Livewire\Counter::class)

    <script>
        // find all elements with wire:snapshot
        document.querySelectorAll('[wire\\:snapshot]').forEach(el => {
            let snapshot = JSON.parse(el.getAttribute('wire:snapshot'))

            console.log(snapshot)
        })
        // go through each, pull out the string of data
        // turn that string into an actual JavaScript object
        // ...
    </script>
</html>
