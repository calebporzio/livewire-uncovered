<?php

namespace App;

use ReflectionClass;
use ReflectionProperty;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Str;

class Livewire
{
    function initialRender($class) {
        $component = new $class;

        if (method_exists($component, 'mount')) {
            $component->mount();
        }

        [$html, $snapshot] = $this->toSnapshot($component);

        $snapshotAttribute = htmlentities(json_encode($snapshot));

        return <<<HTML
            <div wire:snapshot="{$snapshotAttribute}">
                {$html}
            </div>
        HTML;
    }

    function toSnapshot($component) {
        $html = Blade::render(
            $component->render(),
            $properties = $this->getProperties($component)
        );

        $snapshot = [
            'class' => get_class($component),
            'data' => $properties,
        ];

        return [$html, $snapshot];
    }

    function fromSnapshot($snapshot) {
        $class = $snapshot['class'];
        $data = $snapshot['data'];

        $component = new $class;

        $this->setProperties($component, $data);

        return $component;
    }

    function setProperties($component, $properties) {
        foreach ($properties as $key => $value) {
            $component->{$key} = $value;
        }
    }

    function getProperties($component) {
        $properties = [];

        $reflectedProperties = (new ReflectionClass($component))->getProperties(ReflectionProperty::IS_PUBLIC);

        foreach ($reflectedProperties as $property) {
            $properties[$property->getName()] = $property->getValue($component);
        }

        return $properties;
    }

    function callMethod($component, $method) {
        $component->{$method}();
    }

    function updateProperty($component, $property, $value) {
        $component->{$property} = $value;

        $updatedHook = 'updated'.Str::title($property);

        if (method_exists($component, $updatedHook)) {
            $component->{$updatedHook}();
        }
    }
}
