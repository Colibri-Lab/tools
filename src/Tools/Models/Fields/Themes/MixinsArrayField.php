<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ArrayField;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\MixinsObjectField;
# endregion Uses;

/**
 * Array field for mixins
 * @class
 * @extends ArrayField
 * 
 * @method MixinsObjectField Item(int $index)
 * @method MixinsObjectField offsetGet(mixed $offset)
 */
class MixinsArrayField extends ArrayField
{
    /**
     * Json schema for the mixins array field
     * @public
     * @const
     * @var array
     */
    public const JsonSchema = [
        'type' => 'array',
        'items' => MixinsObjectField::JsonSchema
    ];
}
