<?php

namespace App\Modules\Tools\Controllers;

use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Notices;
use Colibri\Exceptions\ValidationException;
use Colibri\Web\Controller as WebController;
use Colibri\Web\RequestCollection;
use InvalidArgumentException;

/**
 * Notices controller
 */
class NoticesController extends WebController
{
    /**
     * Returns a list of notice templates
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function List(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.notices')) {
            return $this->Finish(403, 'Permission denied');
        }

        $notices = Notices::LoadAll();
        $noticesArray = [];
        foreach ($notices as $notice) {
            $noticesArray[] = $notice->ToArray(true);
        }
        return $this->Finish(200, 'ok', $noticesArray);
    }

    /**
     * Creates a notice template
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @throws InvalidArgumentException
     * @return object
     */
    public function Create(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.notices.add')) {
            return $this->Finish(403, 'Permission denied');
        }


        $name = $post->name;

        $notice = Notices::LoadEmpty();

        $accessPoint = $notice->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $notice->name = $name;

            if (($res = $notice->Save(true)) !== true) {
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

        $notices = Notices::LoadAll();
        $noticesArray = [];
        foreach ($notices as $notice) {
            $noticesArray[] = $notice->ToArray(true);
        }
        return $this->Finish(200, 'ok', $noticesArray);


    }

    /**
     * Deletes a notice template
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function Delete(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.notices.remove')) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->notice;
        if (!$id) {
            return $this->Finish(400, 'Bad request');
        }

        $setting = Notices::LoadById((int) $id);
        $setting->Delete();

        return $this->Finish(200, 'ok');


    }

    /**
     * Saves a notice template data
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @throws InvalidArgumentException
     * @return object
     */
    public function Save(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.notices.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;
        if (!$id) {
            return $this->Finish(400, 'Bad request');
        }

        $notice = Notices::LoadById((int) $id);

        $accessPoint = $notice->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $notice->name = $post->name;
            $notice->subject = $post->subject;
            $notice->body = $post->body;

            if (($res = $notice->Save(true)) !== true) {
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

        return $this->Finish(200, 'ok', $notice->ToArray(true));


    }

}