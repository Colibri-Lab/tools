<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\DataAccessPoint;
use Colibri\Data\SqlClient\IDataReader;
use Colibri\Data\Storages\Storages;
use Colibri\Data\Storages\Storage;
use Colibri\Utils\Logs\Logger;
use Colibri\Data\Storages\Models\DataTable as BaseModelDataTable;
use App\Modules\Tools\Models\Theme;

/**
 * Таблица, представление данных в хранилище #{tools-storages-themes-desc;Темы}
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * @method Theme[] getIterator()
 * @method Theme _createDataRowObject()
 * @method Theme _read()
 * 
 */
class Themes extends BaseModelDataTable {

    /**
     * Конструктор
     * @param DataAccessPoint $point точка доступа
     * @param IDataReader|null $reader ридер
     * @param string|\Closure $returnAs возвращать в виде класса
     * @param Storage|null $storage хранилище
     * @return void 
     */
    public function __construct(DataAccessPoint $point, IDataReader $reader = null, string $returnAs = 'Theme', Storage|null $storage = null)
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
     * @return Themes
     */
    static function LoadByFilter(int $page = -1, int $pagesize = 20, string $filter = null, string $order = null, array $params = [], bool $calculateAffected = true) : ?Themes
    {
        $storage = Storages::Create()->Load('themes');
        $additionalParams = ['page' => $page, 'pagesize' => $pagesize, 'params' => $params];
        $additionalParams['type'] = $calculateAffected ? DataAccessPoint::QueryTypeReader : DataAccessPoint::QueryTypeBigData;
        return self::LoadByQuery(
            $storage,
            'select * from ' . $storage->name . 
                ($filter ? ' where ' . $filter : '') . 
                ($order ? ' order by ' . $order : ''), 
            $additionalParams
        );
    }

    /**
     * Загружает без фильтра
     * @param int $page страница
     * @param int $pagesize размер страницы
     * @return Themes 
     */
    static function LoadAll(int $page = -1, int $pagesize = 20, bool $calculateAffected = false) : ?Themes
    {
        return self::LoadByFilter($page, $pagesize, null, null, [], $calculateAffected);
    }

    static function LoadByDomain(string $domain): ?Themes
    {
        return self::LoadByFilter(1, 1000, '{domain}=[[domain:string]]', null, ['domain' => $domain], false);
    }

    /**
     * Возвращает модель по ID
     * @param int $id ID строки
     * @return Theme|null
     */
    static function LoadById(int $id) : Theme|null 
    {
        $table = self::LoadByFilter(1, 1, '{id}=[[id:integer]]', null, ['id' => $id], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Возвращает текущую тему
     * @param string $domain
     * @return Theme|null
     */
    static function LoadCurrent(string $domain) : Theme|null 
    {
        $table = self::LoadByFilter(1, 1, '{domain}=[[domain:string]] and {current}=1', null, ['domain' => $domain], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Создание модели по названию хранилища
     * @return Theme
     */
    static function LoadEmpty() : Theme
    {
        $table = self::LoadByFilter(-1, 20, 'false', null, [], false);
        return $table->CreateEmptyRow();
    }

    /**
     * Удаляет все по списку ID
     * @param int[] $ids ID строки
     * @return bool
     */
    static function DeleteAllByIds(array $ids): bool
    {
        return self::DeleteAllByFilter('{id} in ('.implode(',', $ids).')');
    }

    /**
     * Удаляет все по фильтру
     * @param string $filter фильтр, допускается использование элементов вида {field}
     * @return bool
     */
    static function DeleteAllByFilter(string $filter): bool
    {
        return self::DeleteByFilter('themes', $filter);
    }

    static function DataMigrate(?Logger $logger = null): bool
    {
        // миграция данных
        return true;
    }

}