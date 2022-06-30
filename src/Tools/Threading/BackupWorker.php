<?php

namespace App\Modules\Tools\Threading;
use Colibri\Threading\Worker as BaseWorker;
use Colibri\Utils\Logs\MemoryLogger;
use Colibri\Events\EventsContainer;
use CometApiClient\Client;
use Colibri\App;
use Throwable;
use App\Modules\Tools\Models\Backups;

class BackupWorker extends BaseWorker
{
    public function Run(): void
    {
        $backup = $this->_params->backup;
        $user = $this->_params->user;

        $backup = Backups::LoadById($backup);
        $backup->running = true;
        $backup->Save();

        $cometConfig = App::$config->Query('comet')->AsObject();
        $comet = new Client($cometConfig->host, $cometConfig->port);
        
        $worker = $this;
        $this->_log->HandleEvent(EventsContainer::LogWriten, function($event, $args) use ($worker, $comet, $user) {
            $comet->SendToUser($user, $worker->key, (object)['level' => $args->type, 'message' => $args->message, 'context' => $args->context]);
        });
        
        try {
            
            $backup->Run($this->_log);
            
        }
        catch(Throwable $e) { 
            $this->_log->emergency('Exception: '.$e->getMessage().' '.$e->getFile().' '.$e->getLine());
        }
        finally {

            $backup->running = false;
            $backup->Save();
            
            $this->_log->info("--complete--");
            $comet->SendToUser($user, 'message', (object)['text' => 'Backup complete! Job: '.$worker->key.', backup: '.$backup->id, 'exec' => '() => App.Router.Navigate(\'/mainframe/more/backup/\', {}, true, true)']);
    
        } 
        

    }
}