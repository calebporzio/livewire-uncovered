<?php

Route::view('/', 'welcome');

Route::post('/livewire', function () {
    dd(request('snapshot'));
    dd(request('callMethod'));
    return request()->all();
});

Blade::directive('livewire', function ($expression) {
    return "<?php echo (new App\Livewire)->initialRender({$expression}); ?>";
});
