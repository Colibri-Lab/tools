<?php

namespace App\Modules\Tools\Models;

# region Uses:
use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Fields\ValueField;
use Colibri\Data\Storages\Fields\ObjectField;
# endregion Uses;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;

/**
 * Представление строки в таблице в хранилище #{tools-storages-backups-desc;Точки восстановления}
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * region Properties:
 * @property-read int $id ID строки
 * @property-read DateTimeField $datecreated Дата создания строки
 * @property-read DateTimeField $datemodified Дата последнего обновления строки
 * @property ValueField|null $status #{tools-storages-backups-fields-status-desc;Статус}
 * @property bool|null $running #{tools-storages-backups-fields-running-desc;Запущено}
 * @property string|null $name #{tools-storages-backups-fields-name-desc;Наименование}
 * @property ObjectField|null $cron #{tools-storages-backups-fields-cron-desc;Запись в CRON}
 * @property string|null $file #{tools-storages-backups-fields-file-desc;Шаблон названия файла}
 * endregion Properties;
 */
class Backup extends BaseModelDataRow {
    
    
	
	
	# region Consts:
	/** #{tools-storages-backups-fields-status-values-paused;Остановлено} */
	public const StatusPaused = 'paused';
	/** #{tools-storages-backups-fields-status-values-started;Включено} */
	public const StatusStarted = 'started';
	# endregion Consts;


}