<?php

namespace App\Modules\Tools\Threading;
use Colibri\Threading\Worker as BaseWorker;
use Colibri\Utils\Logs\MemoryLogger;
use Colibri\Events\EventsContainer;
use CometApiClient\Client;
use Colibri\App;
use Throwable;

class ExecuteWorker extends BaseWorker
{
    public function Run(): void
    {
        $script = $this->_params->script;
        $user = $this->_params->user;

        $cometConfig = App::$config->Query('comet')->AsObject();
        $comet = new Client($cometConfig->host, $cometConfig->port);
        
        $worker = $this;
        $this->_log->HandleEvent(EventsContainer::LogWriten, function($event, $args) use ($worker, $comet, $user) {
            $comet->SendToUser($user, $worker->key, (object)['level' => $args->type, 'message' => $args->message, 'context' => $args->context]);
        });
        
        try {
            /** @var $callback \Closure */
            $callback = null;
            $script = '$callback = function(Colibri\Utils\Logs\Logger $logger) {'."\n".$script."\n".' $logger->info("--complete--"); };';
            eval($script);

            $callback($this->_log);
        }
        catch(Throwable $e) { 
            $this->_log->emergency('Exception: '.$e->getMessage().' '.$e->getFile().' '.$e->getLine());
            $this->_log->info("--complete--");
        }
        

    }
}