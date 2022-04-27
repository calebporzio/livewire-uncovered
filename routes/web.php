<?php

Route::view('/', 'welcome');

Route::post('/livewire', function () {
    $component = (new App\Livewire)->fromSnapshot(request('snapshot'));

    // Call methods (wire:click).
    if ($method = request('callMethod')) (new App\Livewire)->callMethod($component, $method);

    // Set properties (wire:model).
    if ([$property, $value] = request('updateProperty')) {
        (new App\Livewire)->updateProperty($component, $property, $value);
    }

    [$html, $snapshot] = (new App\Livewire)->toSnapshot($component);

    return ['html' => $html, 'snapshot' => $snapshot];
});

Blade::directive('livewire', function ($expression) {
    return "<?php echo (new App\Livewire)->initialRender({$expression}); ?>";
});
