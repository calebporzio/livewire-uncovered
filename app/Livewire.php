<?php

namespace App;

use ReflectionClass;
use ReflectionProperty;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Blade;

class Livewire
{
    function initialRender($class)
    {
        $component = new $class;

        method_exists($component, 'mount') && $component->mount();

        [$html, $snapshot] = $this->toSnapshot($component);

        $snapshotAttribute = htmlentities(json_encode($snapshot));

        return <<<HTML
            <div wire:snapshot="{$snapshotAttribute}">
                {$html}
            </div>
        HTML;
    }

    function fromSnapshot($snapshot) {
        $this->checkSnapshot($snapshot);

        $component = new $snapshot['class'];

        $properties = $this->hydrateProperties($snapshot['data'], $snapshot['meta']);

        return $this->setProperties($component, $properties);
    }

    function toSnapshot($component) {
        $properties = $this->getProperties($component);

        $html = Blade::render(
            $component->render(),
            $properties = $this->getProperties($component)
        );

        [$data, $meta] = $this->dehydrateProperties($properties);

        $snapshot = [
            'class' => get_class($component),
            'data' => $data,
            'meta' => $meta,
        ];

        $snapshot['checksum'] = $this->generateChecksum($snapshot);

        return [$html, $snapshot];
    }

    function getProperties($component) {
        $properties = [];

        $reflected = new ReflectionClass($component);

        foreach ($reflected->getProperties(ReflectionProperty::IS_PUBLIC) as $property) {
            $properties[$property->getName()] = $property->getValue($component);
        }

        return $properties;
    }

    function setProperties($component, $properties) {
        foreach ($properties as $key => $value) {
            $component->{$key} = $value;
        }

        return $component;
    }

    function updateProperty($component, $property, $value) {
        if ($hook = method_exists($component, 'updating'.Str::title($property))) {
            $component->{$hook}();
        }

        $component->{$property} = $value;

        if ($hook = method_exists($component, 'updated'.Str::title($property))) {
            $component->{$hook}();
        }
    }

    function callMethod($component, $method) {
        $component->{$method}();
    }

    function dehydrateProperties($properties) {
        $data = $meta = [];

        foreach ($properties as $key => $value) {
            if ($value instanceof Collection) {
                $data[$key] = $value->toArray();
                $meta[$key] = 'collection';
            } else {
                $data[$key] = $value;
            }
        }

        return [$data, $meta];
    }

    function hydrateProperties($data, $meta) {
        $properties = [];

        foreach ($data as $key => $value) {
            if (isset($meta[$key]) && $meta[$key] === 'collection') {
                $value = collect($value);
            }

            $properties[$key] = $value;
        }

        return $properties;
    }

    function checkSnapshot($snapshot) {
        $checksum = $snapshot['checksum'];

        unset($snapshot['checksum']);

        $hash = $this->generateChecksum($snapshot);

        if (! hash_equals($hash, $checksum)) {
            throw new \Exception('Stop hacking me!!!');
        }

        return $snapshot;
    }

    function generateChecksum($snapshot) {
        $key = app('encrypter')->getKey();

        return hash_hmac('sha256', json_encode($snapshot), $key);
    }
}
