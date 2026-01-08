<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSourceRequest extends FormRequest
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
        $sourceId = $this->route('source')->id;

        return [
            'name' => 'sometimes|string|max:255|unique:sources,name,' . $sourceId,
            'type' => 'sometimes|in:rest_api,rss',
            'is_active' => 'boolean',
            'configuration' => 'sometimes|array',
            'configuration.base_url' => 'sometimes|url',
            'configuration.api_key_placeholder' => 'nullable|string',
            'configuration.api_key_env' => 'nullable|string',
            'configuration.method' => 'sometimes|in:GET,POST',
            'configuration.headers' => 'nullable|array',
            'configuration.query_params' => 'nullable|array',
            'configuration.articles_path' => 'sometimes|string',
            'configuration.field_mapping' => 'sometimes|array',
            'configuration.field_mapping.title' => 'sometimes|string',
            'configuration.field_mapping.description' => 'sometimes|string',
            'configuration.field_mapping.url' => 'sometimes|string',
            'configuration.field_mapping.image_url' => 'nullable|string',
            'configuration.field_mapping.published_at' => 'sometimes|string',
            'configuration.field_mapping.source_name' => 'nullable|string',
            'configuration.field_mapping.author' => 'nullable|string',
            'configuration.field_mapping.category' => 'nullable|string',
            'configuration.default_category' => 'nullable|string',
        ];
    }
}
