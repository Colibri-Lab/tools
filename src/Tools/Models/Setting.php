<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;
use Colibri\Data\Storages\Fields\TextArea;
use Colibri\Data\Storages\Fields\ValueField;

/**
 * Представление строки в таблице в хранилище Настройки
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * region Properties:
 * @property-read int $id ID строки
 * @property-read DateTimeField $datecreated Дата создания строки
 * @property-read DateTimeField $datemodified Дата последнего обновления строки
 * @property string|null $name Наименование настройки
 * @property ValueField $type Тип настройки
 * @property string|null $desc Описание настройки
 * @property string|null $value Значение
 * endregion Properties;
 */
class Setting extends BaseModelDataRow
{

    public const JsonSchema = [
        'type' => 'object',
        'required' => [
            'id',
            'datecreated',
            'datemodified',
            # region SchemaRequired:
			'type',
			# endregion SchemaRequired;
        ],
        'properties' => [
            'id' => ['type' => 'integer'],
            'datecreated' => ['type' => 'string', 'format' => 'db-date-time'],
            'datemodified' => ['type' => 'string', 'format' => 'db-date-time'],
            # region SchemaProperties:
			'name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'type' => ['type' => 'string', 'enum' => ['integer', 'double', 'text', 'textarea', 'html', 'htmlcode', 'file', 'files']],
			'desc' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 1024, ] ] ],
			'value' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', ] ] ],
			# endregion SchemaProperties;
        ]
    ];

    const TypeInteger = 'integer';

    const TypeDouble = 'double';
    const TypeText = 'text';
    const TypeTextArea = 'textarea';
    const TypeHtml = 'html';
    const TypeCode = 'htmlcode';
    const TypeFile = 'file';
    const TypeFiles = 'files';

    public function getPropertyValue(): mixed
    {
        $value = $this->_data['settings_value'];
        switch ($this->type) {
            default:
            case Setting::TypeFile:
            case Setting::TypeFiles:
            case Setting::TypeText:
            case Setting::TypeHtml:
            case Setting::TypeCode:
            case Setting::TypeTextArea:
                return $value;
            case Setting::TypeInteger:
                return (int) $value;
            case Setting::TypeDouble:
                return (float) $value;
        }
    }

}