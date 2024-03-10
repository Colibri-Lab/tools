<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\Storages\Fields\DateField;
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
 * @property int $id ID строки
 * @property DateTimeField $datecreated Дата создания строки
 * @property DateTimeField $datemodified Дата последнего обновления строки
 * @property DateTimeField $datedeleted Дата удаления строки (если включно мягкое удаление)
 * @property string|string|null $name Наименование настройки
 * @property ValueField|string|string|int|float $type Тип настройки
 * @property string|string|null $desc Описание настройки
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
			'type' => ['type' => 'string', 'enum' => ['integer', 'double', 'text', 'textarea', 'html', 'htmlcode', 'date', 'datetime', 'file', 'files']],
			'desc' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 1024, ] ] ],
			'value' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', ] ] ],
			# endregion SchemaProperties;
        ]
    ];

    # region Consts:
	/** Целое число */
	public const TypeInteger = 'integer';
	/** Число с плавающей запятой */
	public const TypeDouble = 'double';
	/** Текст */
	public const TypeText = 'text';
	/** Большой текст */
	public const TypeTextarea = 'textarea';
	/** Редактор HTML */
	public const TypeHtml = 'html';
	/** Код HTML */
	public const TypeHtmlcode = 'htmlcode';
	/** Дата */
	public const TypeDate = 'date';
	/** Дата и время */
	public const TypeDatetime = 'datetime';
	/** Файл */
	public const TypeFile = 'file';
	/** Файлы */
	public const TypeFiles = 'files';
	# endregion Consts;

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
            case Setting::TypeDate:
                return new DateField($value);
            case Setting::TypeDateTime:
                return new DateTimeField($value);
        }
    }

}