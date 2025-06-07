<?php

namespace App\Modules\Tools\Controllers;

use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Settings;
use Colibri\Exceptions\ApplicationErrorException;
use Colibri\Exceptions\BadRequestException;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\Exceptions\ValidationException;
use Colibri\Web\Controller as WebController;
use Colibri\Web\RequestCollection;
use InvalidArgumentException;

/**
 * Site settings controller
 */
class SettingsController extends WebController
{
    /**
     * Returns a list of settings
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

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.settings')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $settings = Settings::LoadAll();
        $settingsArray = [];
        foreach ($settings as $setting) {
            $settingsArray[] = $setting->ToArray(true);
        }
        return $this->Finish(200, 'ok', $settingsArray);
    }

    /**
     * Deletes a site settings
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

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.settings.remove')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'setting'};
        if (!$id) {
            throw new BadRequestException('Bad request', 400);
        }

        $setting = Settings::LoadById((int) $id);
        $setting->Delete();

        return $this->Finish(200, 'ok');


    }

    /**
     * Saves a setting
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
        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.settings' . ($id ? '.edit' : '.add'))) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if ($id) {
            $setting = Settings::LoadById((int) $id);
        } else {
            $setting = Settings::LoadEmpty();
        }

        $type = $post->{'type'};
        if (is_array($type) || is_object($type)) {
            $type = (object) $type;
            $type = $type->value;
        }

        $accessPoint = $setting->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $setting->name = $post->{'name'};
            $setting->desc = $post->{'desc'};
            $setting->type = $type;
            $setting->value = $post->{'value'};

            if (($res = $setting->Save(true)) !== true) {
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

        return $this->Finish(200, 'ok', $setting->ToArray(true));


    }

}
