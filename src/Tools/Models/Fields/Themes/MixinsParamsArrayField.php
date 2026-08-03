<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ArrayField;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\MixinsParamsObjectField;
# endregion Uses;

/**
 * Array field for mixins parameters
 * @class
 * @extends ArrayField
 * 
 * @method MixinsParamsObjectField Item(int $index)
 * @method MixinsParamsObjectField offsetGet(mixed $offset)
 */
class MixinsParamsArrayField extends ArrayField
{
    /**
     * Json schema for the mixins parameters array field
     * @public
     * @const
     * @var array
     */
    public const JsonSchema = [
        'type' => 'array',
        'items' => MixinsParamsObjectField::JsonSchema
    ];
}
