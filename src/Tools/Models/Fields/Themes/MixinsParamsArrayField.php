<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ArrayField;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\MixinsParamsObjectField;
# endregion Uses;

/**
 * Представление поля в таблице в хранилище Параметры
 * @author <author name and email>
 * @package App\Modules\Tools\Models\Fields\Themes\Fields
 * @method MixinsParamsObjectField Item(int $index)
 * @method MixinsParamsObjectField offsetGet(mixed $offset)
 */
class MixinsParamsArrayField extends ArrayField
{
    public const JsonSchema = [
        'type' => 'array',
        'items' => MixinsParamsObjectField::JsonSchema
    ];
}
