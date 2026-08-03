<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\Storages\Fields\DateField;
use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;
use Colibri\Data\Storages\Fields\TextArea;
use Colibri\Data\Storages\Fields\ValueField;

/**
 * Represents a row in the Settings storage table
 * @class
 * @extends BaseModelDataRow
 * 
 * region Properties:
 * @property int $id ID of the row
 * @property DateTimeField $datecreated Date the row was created
 * @property DateTimeField $datemodified Date the row was last updated
 * @property DateTimeField $datedeleted Date the row was deleted (if soft delete is enabled)
 * @property string|string|null $name Name of the setting
 * @property ValueField|string|string|int|float $type Type of the setting
 * @property string|string|null $desc Description of the setting
 * @property string|null $value Value of the setting
 * endregion Properties;
 */
class Setting extends BaseModelDataRow
{

    /**
     * Json schema for the setting object field
     * @public
     * @const
     * @var array
     */
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
	/** 
     * Integer
     * @const
     * @public 
     */
	public const TypeInteger = 'integer';
	/** 
     * Floating point number
     * @const
     * @public
     */
	public const TypeDouble = 'double';
	/** 
     * Text 
     * @const
     * @public
     */
	public const TypeText = 'text';
	/** 
     * Large text
     * @const
     * @public 
     */
	public const TypeTextarea = 'textarea';
	/** 
     * HTML editor
     * @const
     * @public
     */
	public const TypeHtml = 'html';
	/** 
     * HTML code
     * @const
     * @public
     */
	public const TypeHtmlcode = 'htmlcode';
	/** 
     * Date
     * @const
     * @public
     */
	public const TypeDate = 'date';
	/** 
     * Date and time
     * @const
     * @public
     */
	public const TypeDatetime = 'datetime';
	/** 
     * File
     * @const
     * @public
     */
	public const TypeFile = 'file';
	/** 
     * Files
     * @const
     * @public
     */
	public const TypeFiles = 'files';
	# endregion Consts;

    /**
     * Returns the value of the setting based on its type
     * @return mixed
     * @public
     */
    public function getPropertyValue(): mixed
    {
        $value = $this->_data['settings_value'];
        switch ($this->type) {
            default:
            case Setting::TypeFile:
            case Setting::TypeFiles:
            case Setting::TypeText:
            case Setting::TypeHtml:
            case Setting::TypeHtmlcode:
            case Setting::TypeTextarea:
                return $value;
            case Setting::TypeInteger:
                return (int) $value;
            case Setting::TypeDouble:
                return (float) $value;
            case Setting::TypeDate:
                return new DateField($value);
            case Setting::TypeDatetime:
                return new DateTimeField($value);
        }
    }

}