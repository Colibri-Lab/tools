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
            Item::Create('struct', '#{mainframe-menu-struct;Структура}', '', 'App.Modules.MainFrame.Icons.StructureIcon', '')
                ->Add([
                    Item::Create('settings', '#{tools-menu-settings-data;Настройки}', '#{tools-menu-settings-data-desc;Настройки сайта<br />Здесь можно отредактировать некоторые настройки, предварительно созданные менеджером в менеджере настроек}', 'App.Modules.Tools.Icons.SettingsIcon', 'App.Modules.Tools.SettingsDataPage'),
                    Item::Create('disk', '#{tools-menu-filesondisk;Файлы на диске}', '#{tools-menu-filesondisk-desc;Файлы находящиеся на текущем сервере, на локальной машине. Можно добавить или удалить ненужные файлы. Внимание! При удалении файлов, нужно учесть, что некоторые строки в хранилищах могут ссылаться на них}', 'App.Modules.Tools.Icons.FilesIcon', 'App.Modules.Tools.FilesPage'), 
                    Item::Create('remote', '#{tools-menu-filesremote;Хранилище медиа}', '#{tools-menu-filesremote-desc;Удаленная библиотека файлов. Можно добавить корзины(bucket) и/или очистить их при необходимости}', 'App.Modules.Tools.Icons.RemoteFilesIcon', 'App.Modules.Tools.RemoteFilesSettingsPage')
                ]),
            Item::Create('dev', '#{mainframe-menu-dev;Разработка}', '', 'App.Modules.MainFrame.Icons.DevIcon', '')->Add([
                Item::Create('manager', '#{tools-menu-settings;Настройки сайта}', '#{tools-menu-settings-desc;Менеджер настроек. Можно создать настройку, которую в дальнейшем использовать при разработке или выводе информации на проекте}', 'App.Modules.Tools.Icons.SettingsIcon', 'App.Modules.Tools.SettingsManagerPage'),
                Item::Create('notices', '#{tools-menu-notices;Шаблоны сообщений}', '#{tools-menu-notices-desc;Создайте шаблоны сообщений для общения с пользователем посредством электронной почты}', 'App.Modules.Tools.Icons.NoticesIcon', 'App.Modules.Tools.NoticesPage'),
            ]),
            Item::Create('more', '#{mainframe-menu-more;Инструменты}', '', 'App.Modules.MainFrame.Icons.MoreIcon', '')->Add([
                Item::Create('backup', '#{tools-menu-backups;Слепки системы}', '#{tools-menu-backups-desc;Создайте точку восстановления на случай критических ситуаций. В дальнейшем можно будет вернуть данные из полученного файла}', 'App.Modules.Tools.Icons.BackupIcon', 'App.Modules.Tools.BackupPage'),
                Item::Create('execute', '#{tools-menu-execute;Выполнить}', '#{tools-menu-execute-desc;Выполнить код (PHP). Внимание! Код исполняется в окружении всего проекта, возможны необратимые повреждения!}', 'App.Modules.Tools.Icons.ExecuteIcon', 'App.Modules.Tools.ExecutePHPPage'),
                Item::Create('themes', '#{tools-menu-themes;Темы сайта}', '#{tools-menu-themes-desc;Настройте внешний вид сайта. Можно создать новую тему, или отредактировать существующую}', 'App.Modules.Tools.Icons.ThemesIcon', 'App.Modules.Tools.ThemesPage'),
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
