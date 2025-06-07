<?php

namespace App\Modules\Tools\Controllers;

use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Backups;
use App\Modules\Tools\Threading\BackupWorker;
use Colibri\Exceptions\ApplicationErrorException;
use Colibri\Exceptions\BadRequestException;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\Exceptions\ValidationException;
use Colibri\Threading\Process;
use Colibri\Web\Controller as WebController;
use Colibri\Web\RequestCollection;
use InvalidArgumentException;

/**
 * Backups controller
 */
class BackupController extends WebController
{
    /**
     * List of backup jobs
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function List(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.backups')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $backups = Backups::LoadAll();
        $backupsArray = [];
        foreach ($backups as $backup) {
            $backupsArray[] = $backup->ToArray(true);
        }
        return $this->Finish(200, 'ok', $backupsArray);
    }

    /**
     * Deletes a backup job
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function Delete(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.backups.remove')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'backup'};
        if (!$id) {
            throw new BadRequestException('Bad request', 400);
        }

        $backup = Backups::LoadById((int) $id);
        $backup->Delete();

        return $this->Finish(200, 'ok');


    }

    /**
     * Saves a backup job data
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @throws InvalidArgumentException
     * @return object
     */
    public function Save(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};
        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.backups' . ($id ? '.edit' : '.add'))) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if ($id) {
            $backup = Backups::LoadById((int) $id);
        } else {
            $backup = Backups::LoadEmpty();
        }


        $accessPoint = $backup->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $backup->name = $post->{'name'};
            $backup->cron = $post->{'cron'};
            $backup->file = $post->{'file'};
            $backup->status = $post->{'status'};
            $backup->running = $post->{'running'};

            if (($res = $backup->Save(true)) !== true) {
                throw new InvalidArgumentException($res->error, 400);
            }

        } catch (InvalidArgumentException $e) {
            $accessPoint->Rollback();
            throw new BadRequestException($e->getMessage(), 400, $e);
        } catch (ValidationException $e) {
            $accessPoint->Rollback();
            throw new ApplicationErrorException($e->getMessage(), 500, $e);
        } catch (\Throwable $e) {
            $accessPoint->Rollback();
            throw new ApplicationErrorException($e->getMessage(), 500, $e);
        }

        $accessPoint->Commit();

        return $this->Finish(200, 'ok', $backup->ToArray(true));


    }

    /**
     * Runs a jobs from crontab
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function Cron(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        $backup = $get->{'backup'};
        $user = $get->{'user'};

        $backup = Backups::LoadById($backup);
        if (!$backup) {
            return $this->Finish(404, 'Not Found');
        }

        $worker = new BackupWorker(0, 0, 'backup-' . $backup->id);
        $process = new Process($worker);
        $process->params = ['backup' => $backup->id, 'user' => $user];
        $process->Run();

        exit;

    }


}