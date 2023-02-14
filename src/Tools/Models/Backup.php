<?php

namespace App\Modules\Tools\Models;

# region Uses:
use App\Modules\Tools\Models\Fields\Backups\CronObjectField;
use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Fields\ObjectField;
use Colibri\Data\Storages\Fields\ValueField;
# endregion Uses;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;
use Colibri\Threading\Process;
use App\Modules\Tools\Threading\BackupWorker;
use App\Modules\Security\Module as SecurityModule;
use Colibri\Utils\Logs\Logger;
use Colibri\App;
use Colibri\IO\FileSystem\File;
use Colibri\Data\DataAccessPoints;
use Google\Type\DateTime;
use Colibri\IO\FileSystem\Directory;
use PhpOffice\PhpWord\Shared\ZipArchive;

/**
 * Представление строки в таблице в хранилище Точки восстановления
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * region Properties:
 * @property int $id ID строки
 * @property DateTimeField $datecreated Дата создания строки
 * @property DateTimeField $datemodified Дата последнего обновления строки
 * @property ValueField|string|null $status Статус
 * @property bool|null $running Запущено
 * @property string|null $name Наименование
 * @property CronObjectField|null $cron Запись в CRON
 * @property string|null $file Шаблон названия файла
 * endregion Properties;
 * @property-read string $controller вызов контроллера
 */
class Backup extends BaseModelDataRow
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
			'status' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['paused', 'started']] ] ],
			'running' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => ['boolean','number'], 'enum' => [true, false, 0, 1],] ] ],
			'name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'cron' => [  'oneOf' => [ CronObjectField::JsonSchema, [ 'type' => 'null'] ] ],
			'file' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			# endregion SchemaProperties;
		]
	];

	# region Consts:
	/** Остановлено */
	public const StatusPaused = 'paused';
	/** Включено */
	public const StatusStarted = 'started';
	# endregion Consts;


	public function getPropertyController(): string
	{
		$currentUser = SecurityModule::$instance->current;
		$userGUID = $currentUser ? md5($currentUser->id) : null;
		return '/usr/bin/sh ' . App::$appRoot . 'bin/tools-backup.sh ' . $this->id . ' ' . $userGUID;
	}


	public function Run(Logger $logger): void
	{
		$dt = new DateTimeField('now');
		$runtimePath = App::$appRoot . App::$config->Query('runtime', 'runtime/')->GetValue() . 'backups/';
		$fileName = $this->file;
		$fileName = str_replace('[[date]]', $dt->format('yyyy-MM-dd-HH-mm-ss'), $fileName);

		if (Directory::Exists($runtimePath . $fileName . '/')) {
			Directory::Delete($runtimePath . $fileName . '/');
		}
		Directory::Create($runtimePath . $fileName . '/', true);

		$logger->debug('Starting backup ...');

		if (method_exists(App::$instance, 'Backup')) {
			App::$instance->Backup($logger, $runtimePath . $fileName . '/');
		}
		foreach (App::$moduleManager->list as $module) {
			$logger->debug('Backuping module ' . $module->name);
			if (method_exists($module, 'Backup')) {
				$module->Backup($logger, $runtimePath . $fileName . '/');
			}
		}

		shell_exec('cd ' . $runtimePath . ' && tar -cf ' . $fileName . '.tar ' . $fileName . '/ && gzip ' . $fileName . '.tar');
		Directory::Delete($runtimePath . $fileName);

		$logger->debug('Backup complete');

	}

	public function Save(bool $performValidationBeforeSave = false): bool|QueryInfo
	{
		$cronCommand = $this->cron->minute->value . ' ' . $this->cron->hour->value . ' ' . $this->cron->day->value . ' ' . $this->cron->month->value . ' ' . $this->cron->dayofweek->value . ' root ' . $this->controller;
		$enabledCrons = $this->_readCronFile();

		if ($this->status->value === self::StatusStarted) {
			$enabledCrons[(string) $this->id] = $cronCommand;
		} else {
			unset($enabledCrons[(string) $this->id]);
		}

		$this->_saveCronFile($enabledCrons);

		return parent::Save($performValidationBeforeSave);
	}

	private function _readCronFile(): array
	{
		$path = App::$appRoot . 'bin/cron';
		$lines = '';
		if (File::Exists($path)) {
			$lines = File::Read($path);
		}

		$lines = $lines ? explode("\n", $lines) : [];

		$ret = [];
		for ($i = 0; $i < count($lines) - 1; $i += 2) {
			$ret[(string) trim($lines[$i], '# ')] = $lines[$i + 1];
		}

		return $ret;

	}

	private function _saveCronFile($commands): void
	{

		$lines = [];
		$path = App::$appRoot . 'bin/cron';
		shell_exec('sudo chmod 777 ' . $path);
		foreach ($commands as $id => $command) {
			$lines[] = '# ' . $id;
			$lines[] = $command;
		}

		File::Write($path, implode("\n", $lines) . "\n");
		shell_exec('sudo chmod 655 ' . $path);

	}

}