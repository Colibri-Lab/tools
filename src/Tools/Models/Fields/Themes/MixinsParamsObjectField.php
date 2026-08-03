<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ObjectField;

# region Uses:

# endregion Uses;

/**
 * Object field for mixins parameters
 * @class
 * @extends ObjectField
 * 
 * region Properties:
 * @property string|null $name Name of the parameter
 * endregion Properties;
 */
class MixinsParamsObjectField extends ObjectField
{
    /**
     * Json schema for the mixins parameters object field
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
			# endregion SchemaProperties;
        ]
    ];
}
