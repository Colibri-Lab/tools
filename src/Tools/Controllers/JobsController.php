<?php

namespace App\Modules\Tools\Controllers;

use Colibri\App;
use App\Modules\Tools\Module;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use Colibri\Web\RequestCollection;
use InvalidArgumentException;
use Colibri\Queue\Manager as QueueManager;

/**
 * Work with jobs
 * @author self
 * @package App\Modules\Tools\Controllers
 */
class JobsController extends WebController
{

    /**
     * Lists an active jobs, errors and successed
     * @param RequestCollection $get данные GET
     * @param RequestCollection $post данные POST
     * @param mixed $payload данные payload обьекта переданного через POST/PUT
     * @return object
     */
    public function Dashboard(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload = null): object
    {

        $result = [];
        $message = 'Result message';
        $code = 200;

        $result = QueueManager::Instance()->Dashboard();
            
        return $this->Finish(
            $code,
            $message,
            $result,
            'utf-8'
        );

    }


    
}