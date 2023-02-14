<?php

namespace App\Modules\Tools\Models\Fields\Themes;

use Colibri\Data\Storages\Fields\ArrayField;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\MixinsObjectField;
# endregion Uses;

/**
 * Представление поля в таблице в хранилище Mixin-ы
 * @author <author name and email>
 * @package App\Modules\Tools\Models\Fields\Themes\Fields
 * @method MixinsObjectField Item(int $index)
 * @method MixinsObjectField offsetGet(mixed $offset)
 */
class MixinsArrayField extends ArrayField
{
    public const JsonSchema = [
        'type' => 'array',
        'items' => MixinsObjectField::JsonSchema
    ];
}
