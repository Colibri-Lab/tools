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
 * @method Setting offsetGet(mixed $offset)
 *
 */
class Settings extends BaseModelDataTable
{
    private static ?array $_allSettings = null;

    /**
     * Конструктор
     * @param DataAccessPoint $point точка доступа
     * @param IDataReader|null $reader ридер
     * @param string|\Closure $returnAs возвращать в виде класса
     * @param Storage|null $storage хранилище
     * @return void
     */
    public function __construct(
        DataAccessPoint $point,
        IDataReader $reader = null,
        string $returnAs = 'Setting',
        Storage|null $storage = null
    ) {
        parent::__construct($point, $reader, $returnAs, $storage);
    }

    /**
     * Кэширует настройки
     */
    public static function Cache(): void
    {
        if (self::$_allSettings) {
            return;
        }
        $allSettings = self::LoadAll();
        self::$_allSettings = [];
        foreach ($allSettings as $setting) {
            self::$_allSettings[$setting->name] = $setting->value;
        }
    }

    public static function Get(string $name): mixed
    {
        self::Cache();
        return self::$_allSettings[$name] ?? null;
    }

    public static function List(?string $like = null): array
    {
        self::Cache();
        if(!$like) {
            return self::$_allSettings;
        }
        $r = [];
        foreach(self::$_allSettings as $k=>$v) {
            if(strstr($k, $like) !== false) {
                $r[str_replace($like, '', $k)] = $v;
            }
        }
        return $r;
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
    public static function LoadByFilter(
        int $page = -1,
        int $pagesize = 20,
        string $filter = null,
        string $order = null,
        array $params = [],
        bool $calculateAffected = true
    ): ?Settings {
        $storage = Storages::Create()->Load('settings');
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params, $calculateAffected);
    }

    /**
     * Загружает без фильтра
     * @param int $page страница
     * @param int $pagesize размер страницы
     * @return Settings
     */
    public static function LoadAll(int $page = -1, int $pagesize = 20, bool $calculateAffected = false): ?Settings
    {
        return self::LoadByFilter($page, $pagesize, null, null, [], false);
    }

    /**
     * Возвращает модель по ID
     * @param int $id ID строки
     * @return Setting|null
     */
    public static function LoadById(int $id): Setting|null
    {
        $table = self::LoadByFilter(1, 1, '{id}=[[id:integer]]', null, ['id' => $id], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Возвращает модель по наименованию
     * @param string $name наименование строки
     * @return Setting|null
     */
    public static function LoadByName(string $name): Setting|null
    {
        $table = self::LoadByFilter(1, 1, '{name}=[[name:string]]', null, ['name' => $name], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Создание модели по названию хранилища
     * @return Setting
     */
    public static function LoadEmpty(?string $name = null, ?string $type = null, mixed $value = null): Setting
    {
        $settings = self::LoadByFilter(-1, 20, 'false');
        $setting = $settings->CreateEmptyRow();
        if ($name) {
            $setting->name = $name;
        }
        if ($type) {
            $setting->type = $type;
        }
        if ($value) {
            $setting->value = $value;
        }
        return $setting;
    }

}
