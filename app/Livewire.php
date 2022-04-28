<?php

namespace App;

use ReflectionClass;
use ReflectionProperty;
use Illuminate\Support\Facades\Blade;

class Livewire
{
    function initialRender($class) {
        $component = new $class;

        $html = Blade::render(
            $component->render(),
            $this->getProperties($component)
        );

        $snapshot = [
            'class' => get_class($component),
            'data' => $this->getProperties($component),
        ];

        $snapshotAttribute = htmlentities(json_encode($snapshot));

        return <<<HTML
            <div wire:snapshot="{$snapshotAttribute}">
                {$html}
            </div>
        HTML;
    }

    function getProperties($component) {
        $properties = [];

        $reflectedProperties = (new ReflectionClass($component))->getProperties(ReflectionProperty::IS_PUBLIC);

        foreach ($reflectedProperties as $property) {
            $properties[$property->getName()] = $property->getValue($component);
        }

        return $properties;
    }
}
