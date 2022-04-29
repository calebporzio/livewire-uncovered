<?php

namespace App;

use ReflectionClass;
use ReflectionProperty;
use Illuminate\Support\Facades\Blade;

class Livewire
{
    function initialRender($class) {
        $component = new $class;

        [$html, $snapshot] = $this->toSnapshot($component);

        $snapshotAttribute = htmlentities(json_encode($snapshot));

        return <<<HTML
            <div wire:snapshot="{$snapshotAttribute}">
                {$html}
            </div>
        HTML;
    }

    function fromSnapshot($snapshot) {
        $class = $snapshot['class'];
        $data = $snapshot['data'];

        $component = new $class;

        $this->setProperties($component, $data);

        return $component;
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
}
