<?php


namespace App\Modules\Tools;

class Installer
{
    private static function _loadConfig($file): ?array
    {
        return yaml_parse_file($file);
    }

    private static function _saveConfig($file, $config): void
    {
        yaml_emit_file($file, $config, \YAML_UTF8_ENCODING, \YAML_ANY_BREAK);
    }

    private static function _getMode($file): string
    {
        $appConfig = self::_loadConfig($file);
        return $appConfig['mode'];
    }

    private static function _injectIntoModuleConfig($file): void
    {

        $modules = self::_loadConfig($file);
        if(is_array($modules['entries'])) {
            foreach($modules['entries'] as $entry) {
                if($entry['name'] === 'Tools') {
                    return;
                }
            }
        }
        else {
            $modules['entries'] = [];
        }

        $modules['entries'][] = [
            'name' => 'Tools',
            'entry' => '\Tools\Module',
            'desc' => 'Инструменты',
            'enabled' => true,
            'visible' => false,
            'for' => [],
            'config' => 'include(/config/tools.yaml)'
        ];

        self::_saveConfig($file, $modules);

    }

    private static function _copyOrSymlink($mode, $pathFrom, $pathTo, $fileFrom, $fileTo): void 
    {
        print_r('Копируем '.$mode.' '.$pathFrom.' '.$pathTo.' '.$fileFrom.' '.$fileTo."\n");
        if(!file_exists($pathFrom.$fileFrom)) {
            print_r('Файл '.$pathFrom.$fileFrom.' не существует'."\n");
            return;
        }

        if(file_exists($pathTo.$fileTo)) {
            print_r('Файл '.$pathTo.$fileTo.' существует'."\n");
            return;
        }

        if($mode === 'local') {
            shell_exec('ln -s '.realpath($pathFrom.$fileFrom).' '.$pathTo.($fileTo != $fileFrom ? $fileTo : ''));
        }
        else {
            shell_exec('cp -R '.realpath($pathFrom.$fileFrom).' '.$pathTo.$fileTo);
        }

        // если это исполняемый скрипт
        if(strstr($pathTo.$fileTo, '/bin/') !== false) {
            chmod($pathTo.$fileTo, 0777);
        }
    }

    /**
     *
     * @param PackageEvent $event
     * @return void
     */
    public static function PostPackageInstall($event)
    {

        print_r('Установка и настройка модуля Colibri Tools Module'."\n");

        $vendorDir = $event->getComposer()->getConfig()->get('vendor-dir').'/';
        $operation = $event->getOperation();
        $installedPackage = $operation->getPackage();
        $targetDir = $installedPackage->getName();
        $path = $vendorDir.$targetDir;
        $configPath = $path.'/src/Tools/config-template/';
        $configDir = './config/';

        if(!file_exists($configDir.'app.yaml')) {
            print_r('Не найден файл конфигурации app.yaml'."\n");
            return;
        }

        $mode = self::_getMode($configDir.'app.yaml');
        
        // копируем конфиг
        print_r('Копируем файлы конфигурации'."\n");
        self::_copyOrSymlink($mode, $configPath, $configDir, 'module-'.$mode.'.yaml', 'tools.yaml');
        self::_copyOrSymlink($mode, $configPath, $configDir, 'tools-storages.yaml', 'tools-storages.yaml');

        print_r('Встраиваем модуль'."\n");
        self::_injectIntoModuleConfig($configDir.'modules.yaml');

        print_r('Установка скриптов'."\n");
        self::_copyOrSymlink($mode, $path.'/src/Tools/bin/', './bin/', 'tools-migrate.sh', 'tools-migrate.sh');
        self::_copyOrSymlink($mode, $path.'/src/Tools/bin/', './bin/', 'tools-models-generate.sh', 'tools-models-generate.sh');

        print_r('Установка завершена'."\n");

    }
}
