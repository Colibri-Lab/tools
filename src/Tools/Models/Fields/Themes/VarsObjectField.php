<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ObjectField;

# region Uses:
use Colibri\Data\Storages\Fields\ValueField;
# endregion Uses;

/**
 * Object field for vars
 * @class
 * @extends ObjectField
 * 
 * region Properties:
 * @property string|null $name Name of the variable
 * @property ValueField|string|string|null $type Type of the variable
 * @property string|null $value Value of the variable
 * endregion Properties;
 */
class VarsObjectField extends ObjectField
{
    /**
     * Json schema for the vars object field
     * @public
     * @const
     * @var array
     */
    public const JsonSchema = [
        'type' => 'object',
        'required' => [
            # region SchemaRequired:

			# endregion SchemaRequired;
        ],
        'properties' => [
            # region SchemaProperties:
			'name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'type' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['color', 'font-family', 'size', 'image', 'border', 'shadow', 'value']] ] ],
			'value' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			# endregion SchemaProperties;
        ]
    ];
}
