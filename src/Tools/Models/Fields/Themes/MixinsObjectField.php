<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ObjectField;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\MixinsParamsArrayField;
use Colibri\Data\Storages\Fields\ArrayField;
# endregion Uses;

/**
 * Представление поля в таблице в хранилище Mixin-ы
 * @author <author name and email>
 * @package App\Modules\Tools\Models\Fields\Themes\Fields
 * 
 * region Properties:
 * @property string|null $name Наименование
 * @property MixinsParamsArrayField|null $params Параметры
 * @property string|null $value Тело
 * endregion Properties;
 */
class MixinsObjectField extends ObjectField
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
			'params' => [  'oneOf' => [ MixinsParamsArrayField::JsonSchema, [ 'type' => 'null'] ] ],
			'value' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 1024, ] ] ],
			# endregion SchemaProperties;
        ]
    ];
}
