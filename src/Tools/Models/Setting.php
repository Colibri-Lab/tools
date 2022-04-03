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
class Setting extends BaseModelDataRow {

    const TypeDouble = 'double';
    const TypeString = 'string';
    const TypeInteger = 'integer';
    const TypeBlob = 'blob';

    public function getPropertyValue(): mixed
    {
        $value = $this->_data['value'];
        switch($this->type) {
            case Setting::TypeBlob:
            case Setting::TypeString:
                return $value;
            case Setting::TypeInteger:
                return (int)$value;
            case Setting::TypeDouble:
                return (float)$value;
        }
        return null;
    }

}