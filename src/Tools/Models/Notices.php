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
 * Table representing data in the storage "Email Templates"
 * @class
 * @extends BaseModelDataTable
 *
 * @method Notice[] getIterator()
 * @method Notice _createDataRowObject()
 * @method Notice _read()
 *
 */
class Notices extends BaseModelDataTable
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
    public function __construct(
        DataAccessPoint $point,
        ?IDataReader $reader = null,
        string $returnAs = 'Notice',
        ?Storage $storage = null
    ) {
        parent::__construct($point, $reader, $returnAs, $storage);
    }


    /**
     * Creates a data table by any filters
     * @param int $page page
     * @param int $pagesize page size
     * @param string $filter filter string
     * @param string $order sort order
     * @param array $params query parameters
     * @return Notices
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
    ): ?Notices {
        $storage = Storages::Instance()->Load('notices', 'tools');
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params, $calculateAffected);
    }

    /**
     * Create table by any filters
     * @param int $page page
     * @param int $pagesize page size
     * @param ?array $filtersArray filters array|object
     * @param string $sortField sort field
     * @param string $sortOrder sort order, default asc
     * @return ?Notices
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
    ) : ?Notices
    {
        $storage = Storages::Instance()->Load('notices', 'tools');
        [$filter, $order, $params] = $storage->accessPoint->ProcessFilters($storage, $searchTerm, $filtersArray, $sortField, $sortOrder);
        return parent::_loadByFilter($storage, $page, $pagesize, $filter, $order, $params);
    }

    /**
     * Loads without filter
     * @param int $page page
     * @param int $pagesize page size
     * @return Notices
     * @public
     * @static
     */
    public static function LoadAll(
        int $page = -1,
        int $pagesize = 20,
        bool $calculateAffected = false
    ): ?Notices {
        return self::LoadByFilter($page, $pagesize, null, '{name}', [], $calculateAffected);
    }

    /**
     * Creates a model by ID
     * @param int $id ID of the row
     * @return Notice|null
     * @public  
     * @static
     */
    public static function LoadById(int $id): Notice|null
    {
        $table = self::LoadByFilter(1, 1, '{id}=[[id:integer]]', null, ['id' => $id], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Creates a model by name
     * @param string $name name of the row
     * @return Notice|null
     * @public
     * @static
     */
    public static function LoadByName(string $name): Notice|null
    {
        $table = self::LoadByFilter(1, 1, '{name}=[[name:string]]', null, ['name' => $name], false);
        return $table && $table->Count() > 0 ? $table->First() : null;
    }

    /**
     * Creates a model by the name of the storage
     * @return Notice
     * @public
     * @static
     */
    public static function LoadEmpty(): Notice
    {
        $table = self::LoadByFilter(-1, 20, 'false', null, [], false);
        return $table->CreateEmptyRow();
    }

    /**
     * Sends a notice to the specified recipient using the provided SMTP configuration.
     * @param string $recipient The email address of the recipient.
     * @param Notice $notice The notice object containing subject, body, and attachments.
     * @param array|null $configArray Optional SMTP configuration array. If not provided, the default configuration will be used.
     * @return bool Returns true if the email was sent successfully, false otherwise.
     * @public
     * @static
     */
    public static function Send(string $recipient, Notice $notice, ?array $configArray = null): bool
    {
        try {
            $configArray = $configArray ?: Module::Instance()->Config()->Query('config.smtp')->AsArray();
            SmtpHelper::Send($configArray, $recipient, $notice->subject, $notice->body, $notice->{'attachments'});
            return true;
        } catch (\Throwable $e) {
            App::$log->debug($e->getMessage() . ' ' . $e->getFile() . ' ' . $e->getLine());
            return false;
        }
    }

}
