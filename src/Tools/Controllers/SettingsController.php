<?php

namespace App\Modules\Tools\Controllers;


use Colibri\App;
use Colibri\Data\SqlClient\QueryInfo;
use Colibri\Events\EventsContainer;
use Colibri\Exceptions\ValidationException;
use Colibri\IO\FileSystem\File;
use Colibri\Utils\Cache\Bundle;
use Colibri\Utils\Debug;
use Colibri\Utils\ExtendedObject;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\Templates\PhpTemplate;
use Colibri\Web\View;
use InvalidArgumentException;
use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\OutputStyle;
use App\Modules\Sites\Models\Pages;
use App\Modules\Security\Module as SecurityModule;
use App\Modules\Sites\Module;
use Colibri\Data\Models\DataModelException;
use App\Modules\Tools\Models\Settings;

class SettingsController extends WebController
{
    public function List(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.settings')) {
            return $this->Finish(403, 'Permission denied');
        }

        $settings = Settings::LoadAll();
        $settingsArray = [];
        foreach ($settings as $setting) {
            $settingsArray[] = $setting->ToArray(true);
        }
        return $this->Finish(200, 'ok', $settingsArray);
    }

    public function Delete(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.settings.remove')) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->setting;
        if (!$id) {
            return $this->Finish(400, 'Bad request');
        }

        $setting = Settings::LoadById((int) $id);
        $setting->Delete();

        return $this->Finish(200, 'ok');


    }

    public function Save(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;
        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.settings' . ($id ? '.edit' : '.add'))) {
            return $this->Finish(403, 'Permission denied');
        }

        if ($id) {
            $setting = Settings::LoadById((int) $id);
        } else {
            $setting = Settings::LoadEmpty();
        }

        $type = $post->type;
        if (is_array($type) || is_object($type)) {
            $type = (object) $type;
            $type = $type->value;
        }

        $accessPoint = $setting->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $setting->name = $post->name;
            $setting->desc = $post->desc;
            $setting->type = $type;
            $setting->value = $post->value;

            if (($res = $setting->Save(true)) !== true) {
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

        return $this->Finish(200, 'ok', $setting->ToArray(true));


    }

}