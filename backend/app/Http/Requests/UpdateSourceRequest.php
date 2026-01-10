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
            'slug' => 'sometimes|string|max:255|unique:sources,slug,' . $sourceId,
            'url' => 'sometimes|url',
            'api_key' => 'nullable|string',
            'is_active' => 'boolean',
            'configuration' => 'sometimes|array',
        ];
    }
}
