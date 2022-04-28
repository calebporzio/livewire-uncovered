<?php

namespace App;

use ReflectionClass;
use ReflectionProperty;
use Illuminate\Support\Facades\Blade;

class Livewire
{
    function initialRender($class) {
        $component = new $class;

        return Blade::render(
            $component->render(),
            $this->getProperties($component)
        );
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
