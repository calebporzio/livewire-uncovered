<?php

use App\Livewire;

Route::view('/', 'welcome');

Route::post('/livewire', function () {
    $component = (new Livewire)->fromSnapshot(request('snapshot'));

    if ($method = request('callMethod')) {
        (new Livewire)->callMethod($component, $method);
    }

    [$html, $snapshot] = (new Livewire)->toSnapshot($component);

    return [
        'html' => $html,
        'snapshot' => $snapshot,
    ];
});

Blade::directive('livewire', function ($expression) {
    return "<?php echo (new App\Livewire)->initialRender({$expression}); ?>";
});
