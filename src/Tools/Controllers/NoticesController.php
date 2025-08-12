<?php

namespace App\Modules\Tools\Controllers;

use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Notices;
use Colibri\Exceptions\ApplicationErrorException;
use Colibri\Exceptions\BadRequestException;
use Colibri\Exceptions\PermissionDeniedException;
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

        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.notices')) {
            throw new PermissionDeniedException('Permission denied', 403);
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
        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.notices.add')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }


        $name = $post->{'name'};

        $notice = Notices::LoadEmpty();

        $accessPoint = $notice->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $notice->name = $name;
            $notice->subject = $post->{'subject'} ?? '';
            $notice->body = $post->{'body'} ?? '';

            if (($res = $notice->Save(true)) !== true) {
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
        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.notices.remove')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'notice'};
        if (!$id) {
            throw new BadRequestException('Bad request', 400);
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
        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.notices.edit')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};
        if (!$id) {
            throw new BadRequestException('Bad request', 400);
        }

        $notice = Notices::LoadById((int) $id);

        $accessPoint = $notice->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $notice->name = $post->{'name'};
            $notice->subject = $post->{'subject'};
            $notice->body = $post->{'body'};

            if (($res = $notice->Save(true)) !== true) {
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

        return $this->Finish(200, 'ok', $notice->ToArray(true));


    }

}