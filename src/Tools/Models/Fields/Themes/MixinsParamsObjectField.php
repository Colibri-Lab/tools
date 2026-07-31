<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ObjectField;

# region Uses:

# endregion Uses;

/**
 * Представление поля в таблице в хранилище Параметры
 * @class
 * @extends ObjectField
 * 
 * region Properties:
 * @property string|null $name Название параметра
 * endregion Properties;
 */
class MixinsParamsObjectField extends ObjectField
{
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
