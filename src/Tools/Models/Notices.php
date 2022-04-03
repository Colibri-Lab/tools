<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\DataAccessPoint;
use Colibri\Data\SqlClient\IDataReader;
use Colibri\Data\Storages\Storages;
use Colibri\Data\Storages\Storage;
use Colibri\Data\Storages\Models\DataTable as BaseModelDataTable;
use App\Modules\Tools\Models\Notice;
use Colibri\Common\SmtpHelper;
use App\Modules\Tools\Module;
use Colibri\App;

/**
 * Таблица, представление данных в хранилище Шаблоны писем
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * @method Notice[] getIterator()
 * @method Notice _createDataRowObject()
 * @method Notice _read()
 * 
 */
class Notices extends BaseModelDataTable {

    /**
     * Конструктор
     * @param DataAccessPoint $point точка доступа
     * @param IDataReader|null $reader ридер
     * @param string|\Closure $returnAs возвращать в виде класса
     * @param Storage|null $storage хранилище
     * @return void 
     */
    public function __construct(DataAccessPoint $point, IDataReader $reader = null, string $returnAs = 'Notice', Storage|null $storage = null)
    {
        parent::__construct($point, $reader, $returnAs, $storage);
    }

    
    /**
     * Создание модели по названию хранилища
     * @param int $page страница
     * @param int $pagesize размер страницы
     * @param string $filter строка фильтрации
     * @param string $order сортировка
     * @param array $params параметры к запросу
     * @return Notices
     */
    static function LoadByFilter(int $page = -1, int $pagesize = 20, string $filter = null, string $order = null, array $params = []) : Notices
    {
        $storage = Storages::Create()->Load('notices');
        return self::LoadByQuery(
            $storage,
            'select * from ' . $storage->name . 
                ($filter ? ' where ' . $filter : '') . 
                ($order ? ' order by ' . $order : ''), 
            ['page' => $page, 'pagesize' => $pagesize, 'params' => $params]
        );
    }

    /**
     * Загружает без фильтра
     * @param int $page страница
     * @param int $pagesize размер страницы
     * @return Notices 
     */
    static function LoadAll(int $page = -1, int $pagesize = 20) : Notices
    {
        return self::LoadByFilter($page, $pagesize, null, null);
    }

    /**
     * Возвращает модель по ID
     * @param int $id ID строки
     * @return Notice|null
     */
    static function LoadById(int $id) : Notice|null 
    {
        $table = self::LoadByFilter(1, 1, '{id}=[[id:integer]]', null, ['id' => $id]);
        return $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Возвращает модель по наименованию
     * @param string $name наименование строки
     * @return Notice|null
     */
    static function LoadByName(string $name) : Notice|null 
    {
        $table = self::LoadByFilter(1, 1, '{name}=[[name:integer]]', null, ['name' => $name]);
        return $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Создание модели по названию хранилища
     * @return Notice
     */
    static function LoadEmpty() : Notice
    {
        $reports = self::LoadByFilter(-1, 20, 'false');
        return $reports->CreateEmptyRow();
    }

    static function Send(string $recipient, Notice $notice): bool
    {
        try {
            $configArray = Module::$instance->Config()->Query('config.smtp')->AsArray();
            SmtpHelper::Send($configArray, $recipient, $notice->subject, $notice->body);
            return true;
        }
        catch(\Throwable $e) {
            App::$log->debug($e->getMessage().' '.$e->getFile().' '.$e->getLine());
            return false;
        }        
    }

}