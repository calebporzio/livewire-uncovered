<html>
    <link rel="stylesheet" href="/app.css">
    <script src="/app.js"></script>

    @include('counter', ['count' => 1])

    @stack('scripts')
</html>
