<?php

namespace App\Support;

use App\Models\Article;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Scout\Builder as ScoutBuilder;

class ArticleQueryBuilder
{
    protected Builder|ScoutBuilder $builder;
    protected bool $isScoutBuilder;
    protected array $pendingScopes = [];

    public function __construct(Builder|ScoutBuilder $builder)
    {
        $this->builder = $builder;
        $this->isScoutBuilder = $builder instanceof ScoutBuilder;
    }

    public function filterBy(array $filters): self
    {
        if ($this->isScoutBuilder) {
            $this->pendingScopes[] = fn($query) => $query->filterBy($filters);
        } else {
            $this->builder->filterBy($filters);
        }

        return $this;
    }

    public function forMyPreferences($preferences): self
    {
        if ($this->isScoutBuilder) {
            $this->pendingScopes[] = fn($query) => $query->forMyPreferences($preferences);
        } else {
            $this->builder->forMyPreferences($preferences);
        }

        return $this;
    }

    protected function applyPendingScopes(): void
    {
        if ($this->isScoutBuilder && !empty($this->pendingScopes)) {
            $this->builder->query(function($query) {
                foreach ($this->pendingScopes as $scope) {
                    $scope($query);
                }
            });
            $this->pendingScopes = [];
        }
    }

    public function paginate(int $perPage = 15)
    {
        $this->applyPendingScopes();
        return $this->builder->paginate($perPage);
    }

    public function get()
    {
        $this->applyPendingScopes();
        return $this->builder->get();
    }

    public function __call($method, $parameters)
    {
        $result = $this->builder->$method(...$parameters);
        
        if ($result === $this->builder) {
            return $this;
        }
        
        return $result;
    }
}
