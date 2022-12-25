<?php


/**
 * Search
 *
 * @author Author Name <author.name@action-media.ru>
 * @copyright 2019 Colibri
 * @package App\Modules\Tools
 */
namespace App\Modules\Tools;

use Colibri\App;
use Colibri\Modules\Module as BaseModule;
use Colibri\Utils\Debug;
use App\Modules\Tools\Controllers\Controller;
use Colibri\Utils\Menu\Item;
use Colibri\Utils\Logs\Logger;
use App\Modules\Tools\Models\Notices;
use App\Modules\Tools\Models\Settings;
use App\Modules\Tools\Models\Backups;
use App\Modules\Tools\Models\Themes;

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
    public function InitializeModule(): void
    {
        self::$instance = $this;
    }

	/**
	 * Вызывается для получения Меню болванкой
	 */
    public function GetTopmostMenu(): Item|array|null {

        return [
            Item::Create('struct', '#{mainframe-menu-struct}', '', 'App.Modules.MainFrame.Icons.StructureIcon', '')
                ->Add([
                    Item::Create('settings', '#{tools-menu-settings-data}', '#{tools-menu-settings-data-desc}', 'App.Modules.Tools.Icons.SettingsIcon', 'App.Modules.Tools.SettingsDataPage'),
                    Item::Create('disk', '#{tools-menu-filesondisk}', '#{tools-menu-filesondisk-desc}', 'App.Modules.Tools.Icons.FilesIcon', 'App.Modules.Tools.FilesPage'), 
                    Item::Create('remote', '#{tools-menu-filesremote}', '#{tools-menu-filesremote-desc}', 'App.Modules.Tools.Icons.RemoteFilesIcon', 'App.Modules.Tools.RemoteFilesSettingsPage')
                ]),
            Item::Create('dev', '#{mainframe-menu-dev}', '', 'App.Modules.MainFrame.Icons.DevIcon', '')->Add([
                Item::Create('manager', '#{tools-menu-settings}', '#{tools-menu-settings-desc}', 'App.Modules.Tools.Icons.SettingsIcon', 'App.Modules.Tools.SettingsManagerPage'),
                Item::Create('notices', '#{tools-menu-notices}', '#{tools-menu-notices-desc}', 'App.Modules.Tools.Icons.NoticesIcon', 'App.Modules.Tools.NoticesPage'),
            ]),
            Item::Create('more', '#{mainframe-menu-more}', '', 'App.Modules.MainFrame.Icons.MoreIcon', '')->Add([
                Item::Create('backup', '#{tools-menu-backups}', '#{tools-menu-backups-desc}', 'App.Modules.Tools.Icons.BackupIcon', 'App.Modules.Tools.BackupPage'),
                Item::Create('execute', '#{tools-menu-execute}', '#{tools-menu-execute-desc}', 'App.Modules.Tools.Icons.ExecuteIcon', 'App.Modules.Tools.ExecutePHPPage'),
                Item::Create('themes', '#{tools-menu-themes}', '#{tools-menu-themes-desc}', 'App.Modules.Tools.Icons.ThemesIcon', 'App.Modules.Tools.ThemesPage'),
            ])
        ];

    }

	public function GetPermissions(): array
    {

        $permissions = parent::GetPermissions();

        $permissions['tools'] = 'Инструменты';
        $permissions['tools.backup'] = 'Доступ к системе восстановления';
        $permissions['tools.backup.create'] = 'Создание точки восстановления';
        $permissions['tools.backup.restore'] = 'Восстановление из точки';
        $permissions['tools.execute'] = 'Выполнение скриптов';

        $permissions['tools.settings'] = 'Настройки сайта';
        $permissions['tools.settings.add'] = 'Добавить настройку';
        $permissions['tools.settings.edit'] = 'Редактировать настройку';
        $permissions['tools.settings.remove'] = 'Удалить настройку';

        $permissions['tools.notices'] = 'Шаблоны сообщений';
        $permissions['tools.notices.add'] = 'Добавить сообщение';
        $permissions['tools.notices.edit'] = 'Редактировать сообщение';
        $permissions['tools.notices.remove'] = 'Удалить сообщение';

        return $permissions;
    }

    public function Backup(Logger $logger, string $path) {
        // Do nothing   
        
        $logger->debug('Exporting data...');

        $modulePath = $path . 'modules/Tools/';

        $logger->debug('Exporting Notices...');
        $table = Notices::LoadAll();
        $table->ExportJson($modulePath . 'notices.json');

        $logger->debug('Exporting Settings...');
        $table = Settings::LoadAll();
        $table->ExportJson($modulePath . 'settings.json');

        $logger->debug('Exporting Backups...');
        $table = Backups::LoadAll();
        $table->ExportJson($modulePath . 'backups.json');

    }

    public function Theme(string $domain): ?string
    {
        $theme = Themes::LoadCurrent($domain, true);
        return $theme ? $theme->Generate() : null;        
    }

}
