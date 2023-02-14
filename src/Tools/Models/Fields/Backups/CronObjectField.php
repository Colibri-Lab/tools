<?php

namespace App\Modules\Tools\Models\Fields\Backups;

use Colibri\Data\Storages\Fields\ObjectField;

# region Uses:
use Colibri\Data\Storages\Fields\ValueField;
# endregion Uses;

/**
 * Представление поля в таблице в хранилище Запись в CRON
 * @author <author name and email>
 * @package App\Modules\Tools\Models\Fields\Backups\Fields
 * 
 * region Properties:
 * @property ValueField|string|null $minute Минута
 * @property ValueField|string|null $hour Час
 * @property ValueField|string|null $day День
 * @property ValueField|string|null $month Месяц
 * @property ValueField|string|null $dayofweek День недели
 * endregion Properties;
 */
class CronObjectField extends ObjectField
{
    public const JsonSchema = [
        'type' => 'object',
        'required' => [
            # region SchemaRequired:

            # endregion SchemaRequired;
        ],
        'properties' => [
            # region SchemaProperties:
			'minute' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]] ] ],
			'hour' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]] ] ],
			'day' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['*', '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]] ] ],
			'month' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['*', '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', 10, 11, 12]] ] ],
			'dayofweek' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['*', 0, 1, 2, 3, 4, 5, 6]] ] ],
            # endregion SchemaProperties;
        ]
    ];
}
