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
            Item::Create('struct', 'Структура', '', 'App.Modules.MainFrame.Icons.StructureIcon', '')
                ->Add([
                    Item::Create('settings', 'Настройки', 'Настройки сайта<br />Здесь можно отредактировать некоторые настройки, предварительно созданные менеджером в менеджере настроек', 'App.Modules.Tools.Icons.SettingsIcon', 'App.Modules.Tools.SettingsDataPage'),
                    Item::Create('disk', 'Файлы на диске', 'Файлы находящиеся на текущем сервере, на локальной машине. Можно добавить или удалить ненужные файлы. Внимание! При удалении файлов, нужно учесть, что некоторые строки в хранилищах могут ссылаться на них', 'App.Modules.Tools.Icons.FilesIcon', 'App.Modules.Tools.FilesPage'), 
                    Item::Create('remote', 'Хранилище медиа', 'Удаленная библиотека файлов. Можно добавить корзины(bucket) и/или очистить их при необходимости', 'App.Modules.Tools.Icons.FilesIcon', 'App.Modules.Tools.RemoteFilesSettingsPage')
                ]),
            Item::Create('dev', 'Разработка', '', 'App.Modules.MainFrame.Icons.DevIcon', '')->Add([
                Item::Create('manager', 'Настройки сайта', 'Менеджер настроек. Можно создать настройку, которую в дальнейшем использовать при разработке или выводе информации на проекте', 'App.Modules.Tools.Icons.SettingsIcon', 'App.Modules.Tools.SettingsManagerPage'),
                Item::Create('notices', 'Шаблоны сообщений', 'Создайте шаблоны сообщений для общения с пользователем посредством электронной почты', 'App.Modules.Tools.Icons.NoticesIcon', 'App.Modules.Tools.NoticesPage'),
            ]),
            Item::Create('more', 'Инструменты', '', 'App.Modules.MainFrame.Icons.MoreIcon', '')->Add([
                Item::Create('backup', 'Слепки системы', 'Создайте точку восстановления на случай критических ситуаций. В дальнейшем можно будет вернуть данные из полученного файла', 'App.Modules.Tools.Icons.BackupIcon', 'App.Modules.Tools.BackupPage'),
                Item::Create('execute', 'Выполнить', 'Выполнить код (PHP). Внимание! Код исполняется в окружении всего проекта, возможны необратимые повреждения!', 'App.Modules.Tools.Icons.ExecuteIcon', 'App.Modules.Tools.ExecutePHPPage'),
                Item::Create('themes', 'Темы сайта', 'Настройте внешний вид сайта. Можно создать новую тему, или отредактировать существующую', 'App.Modules.Tools.Icons.ThemesIcon', 'App.Modules.Tools.ThemesPage'),
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

}
