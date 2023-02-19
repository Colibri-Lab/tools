<?php

namespace App\Modules\Tools\Controllers;

use App\Modules\Security\Module;
use App\Modules\Tools\Threading\ExecuteWorker;
use Colibri\App;
use Colibri\Threading\Process;
use Colibri\Web\Controller as WebController;
use Colibri\Web\RequestCollection;

/**
 * Execute script controller
 */
class ExecuteController extends WebController
{
    /**
     * Runs a php script
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function Run(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        $currentUser = Module::$instance->current;
        $userGUID = md5($currentUser->id);

        $script = $post->{'script'};
        $worker = new ExecuteWorker();
        $process = new Process($worker, true);
        $process->Run((object) ['script' => $script, 'user' => $userGUID, 'requester' => App::$request->headers->{'requester'}]);

        if ($process->IsRunning()) {
            return $this->Finish(200, 'ok', ['pid' => $process->pid, 'key' => $worker->key]);
        }

        return $this->Finish(200, 'ok', []);

    }

    /**
     * Kills a running execution process
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function Kill(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        Process::StopProcess($post->{'pid'});
        return $this->Finish(200, 'ok', []);

    }
}