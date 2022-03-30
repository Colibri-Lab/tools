<?php


/**
 * Search
 *
 * @author Author Name <author.name@action-media.ru>
 * @copyright 2019 AktionDigital
 * @package App\Modules\Tools
 */
namespace App\Modules\Tools;

use AktionDigital\App;
use AktionDigital\Modules\Module as BaseModule;
use AktionDigital\Utils\Debug;
use App\Modules\Tools\Controllers\Controller;

/**
 * Описание модуля
 * @package App\Modules\Tools
 * 
 * 
 */
class Module extends BaseModule
{

    /**
     * Синглтон
     *
     * @var Module
     */
    public static $instance = null;


    /**
     * Инициализация модуля
     * @return void
     */
    public function InitializeModule()
    {
        self::$instance = $this;
    }

	/**
	 * Вызывается для получения Меню болванкой
	 */
    public function GetTopmostMenu() {

        return [];

    }

	public function GetPermissions()
    {

        return parent::GetPermissions();
    }

}
