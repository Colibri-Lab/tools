<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ArrayField;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\VarsObjectField;
# endregion Uses;

/**
 * Представление поля в таблице в хранилище Переменные
 * @author <author name and email>
 * @package App\Modules\Tools\Models\Fields\Themes\Fields
 * @method VarsObjectField Item(int $index)
 * @method VarsObjectField offsetGet(mixed $offset)
 */
class VarsArrayField extends ArrayField
{
    public const JsonSchema = [
        'type' => 'array',
        'items' => VarsObjectField::JsonSchema
    ];
}
