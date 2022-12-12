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
use InvalidArgumentException;

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


        $accessPoint = $backup->Storage()->accessPoint;
        $accessPoint->Begin();

        try {
                
            $backup->name = $post->name;
            $backup->cron = $post->cron;
            $backup->file = $post->file;
            $backup->status = $post->status;
            $backup->running = $post->running;

            if ( ($res = $backup->Save(true)) !== true ) {
                throw new InvalidArgumentException($res->error, 400); 
            }
    
        } catch (InvalidArgumentException $e) {
            $accessPoint->Rollback();
            return $this->Finish(400, 'Bad request', ['message' => $e->getMessage(), 'code' => 400]);
        } catch (ValidationException $e) {
            $accessPoint->Rollback();
            return $this->Finish(500, 'Application validation error', ['message' => $e->getMessage(), 'code' => 400, 'data' => $e->getExceptionDataAsArray()]);
        } catch (\Throwable $e) {
            $accessPoint->Rollback();
            return $this->Finish(500, 'Application error', ['message' => $e->getMessage(), 'code' => 500]);
        } 

        $accessPoint->Commit();

        

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