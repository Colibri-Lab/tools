<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;


/**
 * Model for the notice
 * @class
 * @extends BaseModelDataRow
 * 
 * region Properties:
 * @property int $id Row ID
 * @property DateTimeField $datecreated Date of creation of the row
 * @property DateTimeField $datemodified Date of last modification of the row
 * @property string|null $name Template name
 * @property string|null $subject Email subject
 * @property string|null $body Email body
 * endregion Properties;
 */
class Notice extends BaseModelDataRow
{
    /**
     * Json schema for the notice object field
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
     * Applies the given object to the notice template, replacing placeholders with actual values.
     * @param array|object $object The object containing values to replace in the template.
     * @param array $attachments Optional array of attachments to include in the notice.
     * @return void
     * @public
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