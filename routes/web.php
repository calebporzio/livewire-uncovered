<?php

Route::view('/', 'welcome');

Blade::directive('livewire', function ($expression) {
    return "<?php echo (new App\Livewire)->initialRender({$expression}); ?>";
});
