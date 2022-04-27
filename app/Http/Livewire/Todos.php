<?php

namespace App\Http\Livewire;

class Todos
{
    public $title = '';
    public $todos;

    public function mount()
    {
        $this->title = 'Take out the trash...';
        $this->todos = collect();
    }

    public function add()
    {
        $this->todos->push($this->title);

        $this->title = '';
    }

    public function render()
    {
        return <<<'HTML'
            <div class="todos">
                <input type="text" wire:model="title">

                <button wire:click="add">Add Todo</button>

                <ul>
                    @foreach ($todos as $todo)
                        <li>{{ $todo }}</li>
                    @endforeach
                </ul>
            </div>
        HTML;
    }
}
