<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\DataAccessPoint;
use Colibri\Data\SqlClient\IDataReader;
use Colibri\Data\Storages\Storages;
use Colibri\Data\Storages\Storage;
use Colibri\Utils\Logs\Logger;
use Colibri\Data\Storages\Models\DataTable as BaseModelDataTable;
use App\Modules\Tools\Models\Theme;
use Colibri\App;

/**
 * Representation of the themes storage table
 * @class
 * @extends BaseModelDataTable
 * 
 * @method Theme[] getIterator()
 * @method Theme _createDataRowObject()
 * @method Theme _read()
 * @method Theme offsetGet(mixed $offset)
 * 
 */
class Themes extends BaseModelDataTable
{

    /**
     * Constructor
     * @param DataAccessPoint $point access point
     * @param IDataReader|null $reader reader
     * @param string|\Closure $returnAs return as class
     * @param Storage|null $storage storage
     * @return void 
     * @public
     */
    public function __construct(DataAccessPoint $point, IDataReader $reader = null, string $returnAs = 'Theme', Storage|null $storage = null)
    {
        parent::__construct($point, $reader, $returnAs, $storage);
    }


    /**
     * Creates a model by storage name
     * @param int $page page
     * @param int $pagesize page size
     * @param string $filter filter string
     * @param string $order sort order
     * @param array $params query parameters
     * @return Themes
     * @public
     * @static
     */
    public static function LoadByFilter(int $page = -1, int $pagesize = 20, ?string $filter = null, ?string $order = null, array $params = [], bool $calculateAffected = true): ? Themes
    {
        $storage = Storages::Instance()->Load('themes', 'tools');
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params, $calculateAffected);
    }

    /**
     * Create table by any filters
     * @param int $page page
     * @param int $pagesize page size
     * @param ?array $filtersArray filters array|object
     * @param string $sortField sort field
     * @param string $sortOrder sort order, default asc
     * @return ?Themes
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
    ) : ?Themes
    {
        $storage = Storages::Instance()->Load('themes', 'tools');
        [$filter, $order, $params] = $storage->accessPoint->ProcessFilters($storage, $searchTerm, $filtersArray, $sortField, $sortOrder);
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params);
    }

    /**
     * Loads without filter
     * @param int $page page
     * @param int $pagesize page size
     * @return Themes
     * @public
     * @static
     */
    public static function LoadAll(int $page = -1, int $pagesize = 20, bool $calculateAffected = false): ? Themes
    {
        return self::LoadByFilter($page, $pagesize, null, null, [], $calculateAffected);
    }

    /**
     * Loads all themes for a specific domain
     * @param string $domain The domain to filter themes by
     * @return Themes|null Returns a Themes object containing all themes for the specified domain, or null if none found
     * @public
     * @static
     */
    public static function LoadByDomain(string $domain): ? Themes
    {
        return self::LoadByFilter(1, 1000, '{domain}=[[domain:string]]', null, ['domain' => $domain], false);
    }

    /**
     * Returns the model by ID
     * @param int $id ID of the row
     * @return Theme|null
     * @public
     * @static
     */
    public static function LoadById(int $id): Theme|null
    {
        $table = self::LoadByFilter(1, 1, '{id}=[[id:integer]]', null, ['id' => $id], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Returns the current theme
     * @param string $domain The domain to get the current theme for
     * @return Theme|null
     * @public
     * @static
     */
    public static function LoadCurrent(string $domain, ?string $selectedTheme = null, bool $useCookie = false): Theme|null
    {
        if ($useCookie) {
            $selectedTheme = App::$request->cookie->{'theme'} ?? $selectedTheme;
        }
        $table = self::LoadByFilter(1, 1, '{domain}=[[domain:string]]' . (!$selectedTheme ? ' and {current}=1' : ' and {name}=\'' . $selectedTheme . '\''), null, ['domain' => $domain], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Creates an empty theme model
     * @return Theme
     * @public
     * @static
     */
    public static function LoadEmpty(): Theme
    {
        $table = self::LoadByFilter(-1, 20, 'false', null, [], false);
        return $table->CreateEmptyRow();
    }

    /**
     * Deletes all rows by a list of IDs
     * @param int[] $ids IDs of the rows
     * @return bool
     * @public
     * @static
     */
    public static function DeleteAllByIds(array $ids): bool
    {
        return self::DeleteAllByFilter('{id} in (' . implode(',', $ids) . ')');
    }

    /**
     * Deletes all rows by a filter
     * @param string $filter Filter, allows the use of elements like {field}
     * @return bool
     * @public
     * @static
     */
    public static function DeleteAllByFilter(string $filter): bool
    {
        $storage = Storages::Instance()->Load('themes', 'tools');
        return self::DeleteByFilter($storage, $filter);
    }

    /**
     * Data migration for the themes storage, can be used to update or transform data as needed
     * @param Logger|null $logger Logger for logging
     * @return bool
     * @public
     * @static
     */
    public static function DataMigrate(? Logger $logger = null): bool
    {
        // миграция данных
        return true;
    }

}