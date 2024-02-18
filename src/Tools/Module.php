<?php


/**
 * Tools module package
 *
 * @author Author Name <author.name@action-media.ru>
 * @copyright 2019 Colibri
 * @package App\Modules\Tools
 */
namespace App\Modules\Tools;

use Colibri\Modules\Module as BaseModule;
use Colibri\Utils\Debug;
use Colibri\Utils\Menu\Item;
use Colibri\Utils\Logs\Logger;
use App\Modules\Tools\Models\Notices;
use App\Modules\Tools\Models\Settings;
use App\Modules\Tools\Models\Backups;
use App\Modules\Tools\Models\Themes;

/**
 * Tools module
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
     * Initializes a module
     * @return void
     */
    public function InitializeModule(): void
    {
        self::$instance = $this;
    }

	/**
	 * Returns a topmost menu for backend
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

    /**
     * Returns a permissions for module
     * @return array
     */
	public function GetPermissions(): array
    {

        $permissions = parent::GetPermissions();

        $permissions['tools'] = '#{tools-permissions}';
        $permissions['tools.backup'] = '#{tools-backup-permissions}';
        $permissions['tools.backup.create'] = '#{tools-backup-create-permissions}';
        $permissions['tools.backup.restore'] = '#{tools-backup-restore-permissions}';
        $permissions['tools.execute'] = '#{tools-execute-permissions}';

        $permissions['tools.settings'] = '#{tools-settings-permissions}';
        $permissions['tools.settings.add'] = '#{tools-settings-add-permissions}';
        $permissions['tools.settings.edit'] = '#{tools-settings-edit-permissions}';
        $permissions['tools.settings.remove'] = '#{tools-settings-remove-permissions}';

        $permissions['tools.notices'] = '#{tools-notices-permissions}';
        $permissions['tools.notices.add'] = '#{tools-notices-add-permissions}';
        $permissions['tools.notices.edit'] = '#{tools-notices-edit-permissions}';
        $permissions['tools.notices.remove'] = '#{tools-notices-delete-permissions}';

        return $permissions;
    }

    /**
     * Backups a module data
     * @param Logger $logger
     * @param string $path
     * @return void
     */
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

    /**
     * Generates a theme file for domain and returns a link
     * @param string $domain
     * @return string|null
     */
    public function Theme(string $domain): ?string
    {
        $theme = Themes::LoadCurrent($domain, true);
        return $theme ? $theme->Generate() : null;        
    }
    
    /**
     * Generates a theme file for domain and returns a link
     * @param string $domain
     * @return string|null
     */
    public function ThemeName(string $domain): ?string
    {
        $theme = Themes::LoadCurrent($domain, true);
        return $theme ? $theme->name : null;        
    }

}
