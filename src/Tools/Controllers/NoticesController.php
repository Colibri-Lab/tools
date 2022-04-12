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
use App\Modules\Tools\Models\Notices;

class NoticesController extends WebController
{
    public function List(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.notices')) {
            return $this->Finish(403, 'Permission denied');
        }

        $notices = Notices::LoadAll();
        $noticesArray = [];
        foreach($notices as $notice) {
            $noticesArray[] = $notice->ToArray(true);
        }
        return $this->Finish(200, 'ok', $noticesArray);
    }

    public function Create(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.notices.add')) {
            return $this->Finish(403, 'Permission denied');
        }

        
        $name = $post->name;

        $notice = Notices::LoadEmpty();
        $notice->name = $name;
        $notice->Save();

        $notices = Notices::LoadAll();
        $noticesArray = [];
        foreach($notices as $notice) {
            $noticesArray[] = $notice->ToArray(true);
        }
        return $this->Finish(200, 'ok', $noticesArray);


    }

    public function Delete(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.notices.remove')) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->notice;
        if(!$id) {
            return $this->Finish(400, 'Bad request');
        }

        $setting = Notices::LoadById((int)$id);
        $setting->Delete();

        return $this->Finish(200, 'ok');


    }

    public function Save(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.notices.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;
        if(!$id) {
            return $this->Finish(400, 'Bad request');
        }

        $notice = Notices::LoadById((int)$id);
        $notice->name = $post->name;
        $notice->subject = $post->subject;
        $notice->body = $post->body;
        if(!$notice->Save()) {
            return $this->Finish(400, 'Bad request');
        }

        return $this->Finish(200, 'ok', $notice->ToArray(true));


    }
    
}