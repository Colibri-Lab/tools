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
 * @property int $id ID строки
 * @property DateTimeField $datecreated Дата создания строки
 * @property DateTimeField $datemodified Дата последнего обновления строки
 * @property string|null $name Наименование шаблона
 * @property string|null $subject Тема письма
 * @property string|null $body Тело письма
 * endregion Properties;
 */
class Notice extends BaseModelDataRow
{

    public const JsonSchema = [
        'type' => 'object',
        'required' => [
            'id',
            'datecreated',
            'datemodified',
            # region SchemaRequired:

			# endregion SchemaRequired;
        ],
        'properties' => [
            'id' => ['type' => 'integer'],
            'datecreated' => ['type' => 'string', 'format' => 'db-date-time'],
            'datemodified' => ['type' => 'string', 'format' => 'db-date-time'],
            # region SchemaProperties:
			'name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'subject' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'body' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 1024, ] ] ],
			# endregion SchemaProperties;
        ]
    ];

    /**
     * Обрабатывает вставки
     */
    public function Apply(array |object $object, array $attachments = []): void
    {
        $body = $this->body;
        $subject = $this->subject;

        $object = (array) $object;
        foreach ($object as $key => $value) {
            if(!$value) {
                continue;
            }

            try { $body = str_replace('[[' . $key . ']]', $value, $body); } catch(\Throwable $e) { }
            try {$subject = str_replace('[[' . $key . ']]', $value, $subject); } catch(\Throwable $e) { }
        }

        $this->body = $body;
        $this->subject = $subject;
        $this->{'attachments'} = $attachments;

    }

}