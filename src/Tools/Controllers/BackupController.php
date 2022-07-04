<?php

namespace App\Modules\Tools\Controllers;

use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Settings;
use App\Modules\Tools\Models\Backups;
use Colibri\App;
use Colibri\Common\NoLangHelper;
use App\Modules\Tools\Cron\Manager;
use App\Modules\Tools\Models\Backup;
use App\Modules\Tools\Threading\BackupWorker;
use Colibri\Threading\Process;

class BackupController extends WebController
{
    public function List(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.backups')) {
            return $this->Finish(403, 'Permission denied');
        }

        $backups = Backups::LoadAll();
        $backupsArray = [];
        foreach($backups as $backup) {
            $backupArray = $backup->ToArray(true);
            if(App::$moduleManager->lang) {
                $backupArray = App::$moduleManager->lang->ParseArray($backupArray);
            }
            else {
                $backupArray = NoLangHelper::ParseArray($backupArray);
            }
            $backupsArray[] = $backupArray;
        }
        return $this->Finish(200, 'ok', $backupsArray);
    }

    public function Delete(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.backups.remove')) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->backup;
        if(!$id) {
            return $this->Finish(400, 'Bad request');
        }

        $backup = Backups::LoadById((int)$id);
        $backup->Delete();

        return $this->Finish(200, 'ok');


    }

    public function Save(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;
        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.backups' . ($id ? '.edit' : '.add'))) {
            return $this->Finish(403, 'Permission denied');
        }

        if($id) {
            $backup = Backups::LoadById((int)$id);
        }
        else {
            $backup = Backups::LoadEmpty();
        }

        $backup->name = $post->name;
        $backup->cron = $post->cron;
        $backup->file = $post->file;
        $backup->status = $post->status;
        $backup->running = $post->running;
        if(!$backup->Save()) {
            return $this->Finish(400, 'Bad request');
        }
        
        $backupArray = $backup->ToArray(true);
        if(App::$moduleManager->lang) {
            $backupArray = App::$moduleManager->lang->ParseArray($backupArray);
        }
        else {
            $backupArray = NoLangHelper::ParseArray($backupArray);
        }

        return $this->Finish(200, 'ok', $backupArray);


    }

    public function Cron(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        $backup = $get->backup;
        $user = $get->user;

        $backup = Backups::LoadById($backup);
        if(!$backup) {
            return $this->Finish(404, 'Not Found');
        }

		$worker = new BackupWorker(0, 0, 'backup-'.$backup->id);
		$process = new Process($worker);
		$process->params = ['backup' => $backup->id, 'user' => $user];
        $process->Run();

        exit;

    }
    

}