<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;


/**
 * Представление строки в таблице в хранилище Шаблоны писем
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * region Properties:
 * @property-read int $id ID строки
 * @property-read DateTimeField $datecreated Дата создания строки
 * @property-read DateTimeField $datemodified Дата последнего обновления строки
 * @property string|null $name Наименование шаблона
 * @property string $subject Тема письма
 * @property string|null $body Тело письма
 * @property string|null $value Значение
 * endregion Properties;
 */
class Notice extends BaseModelDataRow {

    /**
     * Обрабатывает вставки
     */
    public function Apply(array|object $object): void
    {
        $body = $this->body;
        $subject = $this->subject;
        
        $object = (array)$object;
        foreach ($object as $key => $value) {
            $body = str_replace('[['.$key.']]', $value, $body);
            $subject = str_replace('[['.$key.']]', $value, $subject);
        }
        
        $this->body = $body;
        $this->subject = $subject;
    }

}