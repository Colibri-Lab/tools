<?php

namespace App\Modules\Tools\Controllers;

use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\IO\FileSystem\File;
use Colibri\App;
use Colibri\Threading\Process;
use App\Modules\Tools\Threading\ExecuteWorker;
use App\Modules\Security\Module;

class ExecuteController extends WebController
{
    public function Run(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        $currentUser = Module::$instance->current;
        $userGUID = md5($currentUser->id);

        $script = $post->script;
        $worker = new ExecuteWorker();
        $process = new Process($worker, true);
        $process->Run((object) ['script' => $script, 'user' => $userGUID, 'requester' => App::$request->headers->requester]);

        if ($process->IsRunning()) {
            return $this->Finish(200, 'ok', ['pid' => $process->pid, 'key' => $worker->key]);
        }

        return $this->Finish(200, 'ok', []);

    }

    public function Kill(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        Process::StopProcess($post->pid);
        return $this->Finish(200, 'ok', []);

    }
}