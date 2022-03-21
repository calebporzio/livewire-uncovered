<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome');

Route::get('/counter', function () {
    return view('counter',[
        'count' => request('count'),
    ])->render();
});
