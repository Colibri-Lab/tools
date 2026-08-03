<?php

namespace App\Modules\Tools\Models;

use Colibri\Data\DataAccessPoint;
use Colibri\Data\SqlClient\IDataReader;
use Colibri\Data\Storages\Storages;
use Colibri\Data\Storages\Storage;
use Colibri\Utils\Logs\Logger;
use Colibri\Data\Storages\Models\DataTable as BaseModelDataTable;
use App\Modules\Tools\Models\Backup;

/**
 * Data table for backups
 * @class
 * @extends BaseModelDataTable
 * 
 * @method Backup[] getIterator()
 * @method Backup _createDataRowObject()
 * @method Backup _read()
 * 
 */
class Backups extends BaseModelDataTable
{

    /**
     * Creates a new instance of the Backups data table
     * @param DataAccessPoint $point data access point
     * @param IDataReader|null $reader data reader
     * @param string|\Closure $returnAs return as class
     * @param Storage|null $storage storage
     * @return void
     * @public
     */
    public function __construct(DataAccessPoint $point, IDataReader $reader = null, string $returnAs = 'Backup', Storage|null $storage = null)
    {
        parent::__construct($point, $reader, $returnAs, $storage);
    }


    /**
     * Creates a model by storage name
     * @param int $page page
     * @param int $pagesize page size
     * @param string $filter filter string
     * @param string $order order
     * @param array $params query parameters
     * @return Backups
     * @public
     * @static
     */
    public static function LoadByFilter(int $page = -1, int $pagesize = 20, string $filter = null, string $order = null, array $params = [], bool $calculateAffected = true): ? Backups
    {
        $storage = Storages::Instance()->Load('backups', 'tools');
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params, $calculateAffected);
    }

    /**
     * Create table by any filters
     * @param int $page page
     * @param int $pagesize page size
     * @param ?array $filtersArray filters array|object
     * @param string $sortField sort field
     * @param string $sortOrder sort order, default asc
     * @return ?Backups
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
    ) : ?Backups
    {
        $storage = Storages::Instance()->Load('backups', 'tools');
        [$filter, $order, $params] = $storage->accessPoint->ProcessFilters($storage, $searchTerm, $filtersArray, $sortField, $sortOrder);
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params);
    }

    /**
     * Creates a model by storage name
     * @param int $page page
     * @param int $pagesize page size
     * @return Backups 
     * @public
     * @static
     */
    public static function LoadAll(int $page = -1, int $pagesize = 20, bool $calculateAffected = false): ? Backups
    {
        return self::LoadByFilter($page, $pagesize, null, null, [], $calculateAffected);
    }

    /**
     * Creates a model by ID
     * @param int $id ID of the row
     * @return Backup|null
     * @public
     * @static
     */
    public static function LoadById(int $id): Backup|null
    {
        $table = self::LoadByFilter(1, 1, '{id}=[[id:integer]]', null, ['id' => $id], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Creates a new empty row
     * @return Backup
     * @public
     * @static
     */
    public static function LoadEmpty(): Backup
    {
        $table = self::LoadByFilter(-1, 20, 'false', null, [], false);
        return $table->CreateEmptyRow();
    }

    /**
     * Deletes all rows by their IDs
     * @param array $ids array of IDs to delete
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
     * @param string $filter filter string
     * @return bool
     * @public
     * @static
     */
    public static function DeleteAllByFilter(string $filter): bool
    {
        $storage = Storages::Instance()->Load('backups', 'tools');
        return self::DeleteByFilter($storage, $filter);
    }

    /**
     * Migrate the data of the module
     * @param Logger|null $logger Logger for logging
     * @return bool Returns true if the migration was successful, false otherwise
     * @public
     * @static
     */
    public static function DataMigrate(? Logger $logger = null): bool
    {
        // миграция данных
        return true;
    }

}