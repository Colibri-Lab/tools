<?php

namespace App\Modules\Tools\Controllers;

use Colibri\Data\SqlClient\QueryInfo;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Backups;
use Colibri\App;
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
            $backupsArray[] = $backup->ToArray(true);
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

        try {
            $backup->Validate(true);
        } catch (\Throwable $e) {
            return $this->Finish(500, $e->getMessage());
        }

        $result = $backup->Save();
        if ($result instanceof QueryInfo) {
            return $this->Finish(500, $result->error);
        }

        return $this->Finish(200, 'ok', $backup->ToArray(true));


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