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
            Item::Create('struct', 'Структура', '', 'green', false, '')
                ->Add([
                    Item::Create('sites', 'Сайты и разделы', '', '', false, '')->Add(
                        Item::Create('settings', 'Настройки', 'Настройки сайта<br />Здесь можно отредактировать некоторые настройки, предварительно созданные менеджером в менеджере настроек', '', true, 'Tools.RouteTo("/settings/data/")')
                    ),
                    Item::Create('files', 'Файлы', '', '', false, '')
                        ->Add([
                            Item::Create('disk', 'На сервере', 'Файлы находящиеся на текущем сервере, на локальной машине. Можно добавить или удалить ненужные файлы. Внимание! При удалении файлов, нужно учесть, что некоторые строки в хранилищах могут ссылаться на них', '', false, 'Tools.RouteTo("/files/disk/")'), 
                            Item::Create('remote', 'Удаленные', 'Удаленная библиотека файлов. Можно добавить корзины(bucket) и/или очистить их при необходимости', '', false, 'Tools.RouteTo("/files/remote/")')
                        ])
                ],
            ),
            Item::Create('dev', 'Разработка', '', 'orange', false, '')->Add([
                Item::Create('settings', 'Настройки', '', '', false, '')
                    ->Add([
                        Item::Create('remote', 'Удаленное файловое хранилище', 'Настройки удаленного хранилища файлов. Адрес и тип подключения', '', false, 'Tools.RouteTo("/settings/remote/")'),
                        Item::Create('manager', 'Настройки сайта', 'Менеджер настроек. Можно создать настройку, которую в дальнейшем использовать при разработке или выводе информации на проекте', '', false, 'Tools.RouteTo("/settings/manager/")'),
                        Item::Create('notices', 'Шаблоны сообщений', 'Создайте шаблоны сообщений для общения с пользователем посредством электронной почты', '', false, 'Tools.RouteTo("/settings/notices/")'),
                    ]),
            ]),
            Item::Create('more', 'ЕЩЕ', '', 'blue', false, '')->Add([
                Item::Create('tools', 'Инструменты', '', '', false, '')
                    ->Add(Item::Create('backup', 'Слепки системы', 'Создайте точку восстановления на случай критических ситуаций. В дальнейшем можно будет вернуть данные из полученного файла', '', false, 'Tools.RouteTo("/backup/")'))
                    ->Add(Item::Create('execute', 'Выполнить', 'Выполнить код (PHP). Внимание! Код исполняется в окружении всего проекта, возможны необратимые повреждения!', '', false, 'Tools.RouteTo("/execute/")')),
                Item::Create('view', 'Внешний вид', '', '', false, '')
                    ->Add([
                        Item::Create('themes', 'Темы сайта', 'Настройте внешний вид сайта. Можно создать новую тему, или отредактировать существующую', '', false, 'Tools.RouteTo("/themes/site/")'),
                        Item::Create('nightmode', 'Темный режим панели администратора', 'Настройка темной темы панели администратора. Можно изменить цвета выделений, цвет подложки и т.д.', '', false, 'Tools.RouteTo("/themes/nightmode/")'),
                    ])
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
