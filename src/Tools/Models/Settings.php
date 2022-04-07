<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\DataAccessPoint;
use Colibri\Data\SqlClient\IDataReader;
use Colibri\Data\Storages\Storages;
use Colibri\Data\Storages\Storage;
use Colibri\Data\Storages\Models\DataTable as BaseModelDataTable;
use App\Modules\Tools\Models\Setting;

/**
 * Таблица, представление данных в хранилище Настройки
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * @method Setting[] getIterator()
 * @method Setting _createDataRowObject()
 * @method Setting _read()
 * 
 */
class Settings extends BaseModelDataTable {

    private static ?array $_allSettings = null; 

    /**
     * Конструктор
     * @param DataAccessPoint $point точка доступа
     * @param IDataReader|null $reader ридер
     * @param string|\Closure $returnAs возвращать в виде класса
     * @param Storage|null $storage хранилище
     * @return void 
     */
    public function __construct(DataAccessPoint $point, IDataReader $reader = null, string $returnAs = 'Setting', Storage|null $storage = null)
    {
        parent::__construct($point, $reader, $returnAs, $storage);
    }

    /**
     * Кэширует настройки
     */
    static function Cache(): void
    {
        if(!self::$_allSettings) {
            return;
        }
        $allSettings = self::LoadAll();
        self::$_allSettings = [];
        foreach($allSettings as $setting) {
            self::$_allSettings[$setting->name] = $setting->value;
        }
    }

    static function Get($name): mixed
    {
        self::Cache();
        return self::$_allSettings[$name] ?? null;
    }
    
    /**
     * Создание модели по названию хранилища
     * @param int $page страница
     * @param int $pagesize размер страницы
     * @param string $filter строка фильтрации
     * @param string $order сортировка
     * @param array $params параметры к запросу
     * @return Settings
     */
    static function LoadByFilter(int $page = -1, int $pagesize = 20, string $filter = null, string $order = null, array $params = []) : Settings
    {
        $storage = Storages::Create()->Load('settings');
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
     * @return Settings 
     */
    static function LoadAll(int $page = -1, int $pagesize = 20) : Settings
    {
        return self::LoadByFilter($page, $pagesize, null, null);
    }

    /**
     * Возвращает модель по ID
     * @param int $id ID строки
     * @return Setting|null
     */
    static function LoadById(int $id) : Setting|null 
    {
        $table = self::LoadByFilter(1, 1, '{id}=[[id:integer]]', null, ['id' => $id]);
        return $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Возвращает модель по наименованию
     * @param string $name наименование строки
     * @return Setting|null
     */
    static function LoadByName(string $name) : Setting|null 
    {
        $table = self::LoadByFilter(1, 1, '{name}=[[name:integer]]', null, ['name' => $name]);
        return $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Создание модели по названию хранилища
     * @return Setting
     */
    static function LoadEmpty(?string $name = null, ?string $type = null, mixed $value = null) : Setting
    {
        $settings = self::LoadByFilter(-1, 20, 'false');
        $setting = $settings->CreateEmptyRow();
        if($name) {
            $setting->name = $name;
        }
        if($type && in_array($type, [Setting::TypeBlob, Setting::TypeDouble, Setting::TypeInteger, Setting::TypeString])) {
            $setting->type = $type;
        }
        if($value) {
            $setting->value = $value;
        }
        return $setting;
    }

}