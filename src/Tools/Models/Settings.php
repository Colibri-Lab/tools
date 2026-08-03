<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\DataAccessPoint;
use Colibri\Data\SqlClient\IDataReader;
use Colibri\Data\Storages\Storages;
use Colibri\Data\Storages\Storage;
use Colibri\Data\Storages\Models\DataTable as BaseModelDataTable;
use App\Modules\Tools\Models\Setting;

/**
 * Data table for settings
 * @class
 * @extends BaseModelDataTable
 *
 * @method Setting[] getIterator()
 * @method Setting _createDataRowObject()
 * @method Setting _read()
 * @method Setting offsetGet(mixed $offset)
 *
 */
class Settings extends BaseModelDataTable
{
    /**
     * Cached settings
     * @var array|null
     * @private
     * @static
     */
    private static ?array $_allSettings = null;

    /**
     * Creates a new instance of the Settings data table
     * @param DataAccessPoint $point data access point
     * @param IDataReader|null $reader data reader
     * @param string|\Closure $returnAs return as class
     * @param Storage|null $storage storage
     * @return void
     * @public
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
     * Caches all settings in memory for quick access
     * @return void
     * @public
     * @static
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

    /**
     * Gets a setting value by name
     * @param string $name name of the setting
     * @return mixed|null value of the setting or null if not found
     * @public
     * @static
     */
    public static function Get(string $name): mixed
    {
        self::Cache();
        return self::$_allSettings[$name] ?? null;
    }

    /**
     * Lists all settings, optionally filtered by a prefix
     * @param string|null $like optional prefix to filter settings
     * @return array list of settings
     * @public
     * @static
     */
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
     * Creates a data table by any filters
     * @param int $page page
     * @param int $pagesize page size
     * @param string $filter filter string
     * @param string $order sort order
     * @param array $params query parameters
     * @return Settings
     * @public
     * @static
     */
    public static function LoadByFilter(
        int $page = -1,
        int $pagesize = 20,
        ?string $filter = null,
        ?string $order = null,
        array $params = [],
        bool $calculateAffected = true
    ): ?Settings {
        $storage = Storages::Instance()->Load('settings', 'tools');
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params, $calculateAffected);
    }

    /**
     * Create table by any filters
     * @param int $page page
     * @param int $pagesize page size
     * @param ?array $filtersArray filters array|object
     * @param string $sortField sort field
     * @param string $sortOrder sort order, default asc
     * @return ?Settings
     * @public
     * @static
     */
    public static function LoadBy(
        int $page = -1, 
        int $pagesize = 20, 
        ?string $searchTerm = null,
        ?array $filtersArray = null,
        ?string $sortField = null,
        string $sortOrder = 'asc'
    ) : ?Settings
    {
        $storage = Storages::Instance()->Load('settings', 'tools');
        [$filter, $order, $params] = $storage->accessPoint->ProcessFilters($storage, $searchTerm, $filtersArray, $sortField, $sortOrder);
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params);
    }

    /**
     * Loads all settings without any filter
     * @param int $page page
     * @param int $pagesize page size
     * @return Settings
     * @public
     * @static
     */
    public static function LoadAll(int $page = -1, int $pagesize = 20, bool $calculateAffected = false): ?Settings
    {
        return self::LoadByFilter($page, $pagesize, null, null, [], false);
    }

    /**
     * Returns the model by ID
     * @param int $id ID of the row
     * @return Setting|null
     * @public
     * @static
     */
    public static function LoadById(int $id): Setting|null
    {
        $table = self::LoadByFilter(1, 1, '{id}=[[id:integer]]', null, ['id' => $id], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Returns the model by name
     * @param string $name name of the row
     * @return Setting|null
     * @public
     * @static
     */
    public static function LoadByName(string $name): Setting|null
    {
        $table = self::LoadByFilter(1, 1, '{name}=[[name:string]]', null, ['name' => $name], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Creates an empty setting model with optional name, type, and value
     * @param string|null $name optional name of the setting
     * @param string|null $type optional type of the setting
     * @param mixed|null $value optional value of the setting
     * @public
     * @static
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
