<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\SqlClient\QueryInfo;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;
use App\Modules\Security\Module as SecurityModule;
use Colibri\Utils\Logs\Logger;
use Colibri\App;
use Colibri\IO\FileSystem\File;
use Colibri\IO\FileSystem\Directory;
# region Uses:
use App\Modules\Tools\Models\Fields\Backups\CronObjectField;
use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Fields\ObjectField;
use Colibri\Data\Storages\Fields\ValueField;
# endregion Uses;

/**
 * Representation of a row in the backup storage table
 * @class
 * @extends BaseModelDataRow
 * 
 * region Properties:
 * @property int $id ID of the row
 * @property DateTimeField $datecreated Date of creation of the row
 * @property DateTimeField $datemodified Date of last modification of the row
 * @property ValueField|string|null $status Status
 * @property bool|null $running Running
 * @property string|null $name Name
 * @property CronObjectField|null $cron CRON entry
 * @property string|null $file File name template
 * endregion Properties;
 * @property-read string $controller вызов контроллера
 */
class Backup extends BaseModelDataRow
{

	/**
	 * Json schema for the backup object field
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
			'status' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['paused', 'started']] ] ],
			'running' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => ['boolean','number'], 'enum' => [true, false, 0, 1],] ] ],
			'name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'cron' => [  'oneOf' => [ CronObjectField::JsonSchema, [ 'type' => 'null'] ] ],
			'file' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			# endregion SchemaProperties;
		]
	];

	# region Consts:
	/** 
	 * Paused 
	 * @const
	 * @public
	 */
	public const StatusPaused = 'paused';
	/** 
	 * Started 
	 * @const
	 * @public
	 */
	public const StatusStarted = 'started';
	# endregion Consts;


	/**
	 * Returns the controller call for the backup
	 * @public
	 * @return string
	 */
	public function getPropertyController(): string
	{
		$currentUser = SecurityModule::Instance()->current;
		$userGUID = $currentUser ? md5($currentUser->id) : null;
		return '/usr/bin/sh ' . App::$appRoot . 'bin/tools-backup.sh ' . $this->id . ' ' . $userGUID;
	}

	/**
	 * Executes the backup job
	 * @public
	 * @param Logger $logger Logger for logging
	 * @return void
	 */
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

		if (method_exists(App::Instance(), 'Backup')) {
			App::Instance()->Backup($logger, $runtimePath . $fileName . '/');
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

	/**
	 * Saves the backup job and updates the cron file accordingly
	 * @public
	 * @param bool $performValidationBeforeSave Whether to perform validation before saving
	 * @return bool|QueryInfo
	 */
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

	/**
	 * Deletes the backup job and removes it from the cron file
	 * @public
	 * @return bool|QueryInfo
	 */
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

	/**
	 * Saves the cron file with the provided commands
	 * @private
	 * @param array $commands The commands to save in the cron file
	 * @return void
	 */
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