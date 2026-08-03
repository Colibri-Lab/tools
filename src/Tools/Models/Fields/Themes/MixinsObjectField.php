<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ObjectField;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\MixinsParamsArrayField;
use Colibri\Data\Storages\Fields\ArrayField;
# endregion Uses;

/**
 * Object field for mixins
 * @class
 * @extends ObjectField
 * 
 * region Properties:
 * @property string|null $name Name
 * @property MixinsParamsArrayField|null $params Parameters
 * @property string|null $value Body
 * endregion Properties;
 */
class MixinsObjectField extends ObjectField
{
    /**
     * Json schema for the mixins object field
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
			'params' => [  'oneOf' => [ MixinsParamsArrayField::JsonSchema, [ 'type' => 'null'] ] ],
			'value' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 1024, ] ] ],
			# endregion SchemaProperties;
        ]
    ];
}
