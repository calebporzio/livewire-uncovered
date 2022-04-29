<?php

namespace App\Http\Livewire;

class Counter
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return <<<'HTML'
            <div class="counter">
                <span>{{ $count }}</span>

                <button wire:click="increment">+</button>
            </div>
        HTML;
    }
}
