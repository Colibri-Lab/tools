<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ArrayField;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\VarsObjectField;
# endregion Uses;

/**
 * Array field for vars
 * @class
 * @extends ArrayField
 * 
 * @method VarsObjectField Item(int $index)
 * @method VarsObjectField offsetGet(mixed $offset)
 */
class VarsArrayField extends ArrayField
{
    /**
     * Json schema for the vars array field
     * @public
     * @const
     * @var array
     */
    public const JsonSchema = [
        'type' => 'array',
        'items' => VarsObjectField::JsonSchema
    ];
}
