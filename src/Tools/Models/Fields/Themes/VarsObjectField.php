<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ObjectField;

# region Uses:
use Colibri\Data\Storages\Fields\ValueField;
# endregion Uses;

/**
 * Представление поля в таблице в хранилище Переменные
 * @author <author name and email>
 * @package App\Modules\Tools\Models\Fields\Themes\Fields
 * 
 * region Properties:
 * @property string|null $name Название переменной
 * @property ValueField|string|null $type Тип переменной
 * @property string|null $value Значение
 * endregion Properties;
 */
class VarsObjectField extends ObjectField
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
			'type' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['color', 'font-family', 'size', 'image', 'border', 'shadow']] ] ],
			'value' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
            # endregion SchemaProperties;
        ]
    ];
}
