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
            'type' => 'required|in:rest_api,rss',
            'is_active' => 'boolean',
            'configuration' => 'required|array',
            'configuration.base_url' => 'required|url',
            'configuration.api_key_placeholder' => 'nullable|string',
            'configuration.api_key_env' => 'nullable|string',
            'configuration.method' => 'required|in:GET,POST',
            'configuration.headers' => 'nullable|array',
            'configuration.query_params' => 'nullable|array',
            'configuration.articles_path' => 'required|string',
            'configuration.field_mapping' => 'required|array',
            'configuration.field_mapping.title' => 'required|string',
            'configuration.field_mapping.description' => 'required|string',
            'configuration.field_mapping.url' => 'required|string',
            'configuration.field_mapping.image_url' => 'nullable|string',
            'configuration.field_mapping.published_at' => 'required|string',
            'configuration.field_mapping.source_name' => 'nullable|string',
            'configuration.field_mapping.author' => 'nullable|string',
            'configuration.field_mapping.category' => 'nullable|string',
            'configuration.default_category' => 'nullable|string',
        ];
    }
}
