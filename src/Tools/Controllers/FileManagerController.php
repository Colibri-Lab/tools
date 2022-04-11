<?php

namespace App\Modules\Tools\Controllers;


use Colibri\App;
use Colibri\Events\EventsContainer;
use Colibri\IO\FileSystem\File;
use Colibri\Utils\Cache\Bundle;
use Colibri\Utils\Debug;
use Colibri\Utils\ExtendedObject;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\Templates\PhpTemplate;
use Colibri\Web\View;
use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\OutputStyle;
use App\Modules\Sites\Models\Pages;
use App\Modules\Security\Module as SecurityModule;
use App\Modules\Sites\Module;
use Colibri\Data\Models\DataModelException;
use App\Modules\Tools\Models\Settings;
use Colibri\IO\FileSystem\Finder;
use Colibri\IO\FileSystem\Directory;

class FileManagerController extends WebController
{
    public function Folders(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $parentPath = $post->path;
        $rootPath = App::$webRoot.App::$config->Query('res')->GetValue();

        $foldersArray = [];
        $di = new Finder();
        $directories = $di->DirectoriesRecursive($rootPath.$parentPath);
        foreach($directories as $directory) {
            $folder = $directory->ToArray();
            $folder['path'] = str_replace($rootPath, '', $folder['path']);
            $folder['parent'] = str_replace($rootPath, '', $folder['parent']);
            $foldersArray[] = $folder;
        }
        return $this->Finish(200, 'ok', $foldersArray);
    }

    public function Files(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $parentPath = $post->path;
        $rootPath = App::$webRoot.App::$config->Query('res')->GetValue();

        $filesArray = [];
        $di = new Finder();
        $files = $di->Files($rootPath.$parentPath);
        foreach($files as $file) {
            $f = $file->ToArray();
            $f['path'] = str_replace($rootPath, '', $f['path']);
            $filesArray[] = $f;
        }
        return $this->Finish(200, 'ok', $filesArray);
    }

    public function CreateFolder(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $folderPath = $post->path;
        $rootPath = App::$webRoot.App::$config->Query('res')->GetValue();

        Directory::Create($rootPath.$folderPath, true);

        $di = new Directory($rootPath.$folderPath);
        $diArray = $di->ToArray();
        $diArray['path'] = str_replace($rootPath, '', $diArray['path']);
        $diArray['parent'] = str_replace($rootPath, '', $diArray['parent']);

        return $this->Finish(200, 'ok', $diArray);
    }

    public function RenameFolder(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $folderPathFrom = $post->pathFrom;
        $folderPathTo = $post->pathTo;
        $rootPath = App::$webRoot.App::$config->Query('res')->GetValue();

        Directory::Move($rootPath.$folderPathFrom, $rootPath.$folderPathTo);
        
        $foldersArray = [];
        $di = new Finder();
        $directories = $di->DirectoriesRecursive($rootPath);
        foreach($directories as $directory) {
            $folder = $directory->ToArray();
            $folder['path'] = str_replace($rootPath, '', $folder['path']);
            $folder['parent'] = str_replace($rootPath, '', $folder['parent']);
            $foldersArray[] = $folder;
        }
        return $this->Finish(200, 'ok', $foldersArray);

    }


}