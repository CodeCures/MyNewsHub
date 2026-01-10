<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSourceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:sources',
            'slug' => 'required|string|max:255|unique:sources',
            'url' => 'required|url',
            'api_key' => 'nullable|string',
            'is_active' => 'boolean',
            'configuration' => 'required|array',
        ];
    }
}
