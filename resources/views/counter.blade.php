<div class="counter">
    <button id="decrement">-</button>
    
    <span id="count">{{ $count }}</span>

    <button id="increment">+</button>
</div>

@push('scripts')
<script>
    let count = 1

    document.addEventListener('click', (e) => {
        let id = e.target.id
        let modifiers = {
            increment: 1,
            decrement: -1,
        }

        if (! modifiers[id]) return

        count = count + modifiers[id]

        fetch('/counter?count='+count).then(i => i.text()).then(html => {
            let container = document.querySelector('.counter')

            container.outerHTML = html
        })
    })
</script>
@endpush
