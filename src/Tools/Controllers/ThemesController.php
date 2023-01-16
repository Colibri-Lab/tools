<?php

namespace App\Modules\Tools\Controllers;

use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Themes;
use Colibri\Exceptions\ValidationException;
use Colibri\Web\Controller as WebController;
use Colibri\Web\RequestCollection;
use InvalidArgumentException;

/**
 * Themes controller
 */
class ThemesController extends WebController
{
    /**
     * Returns a list of themes
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

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.backups')) {
            return $this->Finish(403, 'Permission denied');
        }

        $themes = Themes::LoadAll();
        $themesArray = [];
        foreach ($themes as $theme) {
            $themesArray[] = $theme->ToArray(true);
        }

        return $this->Finish(200, 'ok', $themesArray);
    }

    /**
     * Deletes a theme
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

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.backups.remove')) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->theme;
        if (!$id) {
            return $this->Finish(400, 'Bad request');
        }

        $theme = Themes::LoadById((int) $id);
        $theme->Delete();

        return $this->Finish(200, 'ok');


    }

    /**
     * Saves a theme data
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

        $id = $post->id;
        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes' . ($id ? '.edit' : '.add'))) {
            return $this->Finish(403, 'Permission denied');
        }

        if ($id) {
            $theme = Themes::LoadById((int) $id);
        } else {
            $theme = Themes::LoadEmpty();
        }

        $accessPoint = $theme->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $theme->name = $post->name;
            $theme->domain = $post->domain;
            $theme->desc = $post->desc;
            $theme->current = $post->current;
            $theme->vars = $post->vars;
            $theme->mixins = $post->mixins;

            if (($res = $theme->Save(true)) !== true) {
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

        $themeArray = $theme->ToArray(true);
        return $this->Finish(200, 'ok', $themeArray);

    }

    /**
     * Sets a theme as current
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function SetAsCurrent(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;
        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            return $this->Finish(400, 'Bad request');
        }


        $domainThemes = Themes::LoadByDomain($theme->domain);
        foreach ($domainThemes as $dtheme) {
            $dtheme->current = false;
            $dtheme->Save();
        }

        $theme->current = true;
        if (!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }

        $themeArray = $theme->ToArray(true);
        return $this->Finish(200, 'ok', $themeArray);
    }

    /**
     * Saves a variable
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function SaveVar(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            return $this->Finish(400, 'Bad request');
        }

        $varObject = (object) $post->var;
        if (!$varObject) {
            return $this->Finish(400, 'Bad request');
        }

        $varObject->value = isset($varObject->value['value']) ? $varObject->value['value'] : $varObject->value;

        $found = false;
        foreach ($theme->vars as $index => $var) {
            if ($var->name == $varObject->name) {
                // есть надо обновить
                $theme->vars->Set($index, $varObject);
                $found = true;
                break;
            }
        }

        if (!$found) {
            $theme->vars->Add($varObject);
        }

        if (!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }

        $themeArray = $theme->ToArray(true);
        return $this->Finish(200, 'ok', $themeArray);
    }

    /**
     * Deletes a variable
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function DeleteVars(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            return $this->Finish(400, 'Bad request');
        }

        $varNames = (array) $post->vars;
        if (!$varNames || empty($varNames)) {
            return $this->Finish(400, 'Bad request');
        }

        foreach ($varNames as $varName) {
            foreach ($theme->vars as $index => $var) {
                if ($var->name == $varName) {
                    $theme->vars->DeleteAt($index);
                }
            }
        }


        if (!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }

        $themeArray = $theme->ToArray(true);
        return $this->Finish(200, 'ok', $themeArray);
    }

    /**
     * Saves a mixin
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function SaveMixin(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            return $this->Finish(400, 'Bad request');
        }

        $mixinObject = (object) $post->mixin;
        if (!$mixinObject) {
            return $this->Finish(400, 'Bad request');
        }

        $found = false;
        foreach ($theme->mixins as $index => $mixin) {
            if ($mixin->name == $mixinObject->name) {
                $theme->mixins->Set($index, $mixinObject);
                $found = true;
                break;
            }
        }

        if (!$found) {
            $theme->mixins->Add($mixinObject);
        }

        if (!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }

        $themeArray = $theme->ToArray(true);
        return $this->Finish(200, 'ok', $themeArray);
    }

    /**
     * Deletes a mixin
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function DeleteMixins(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            return $this->Finish(400, 'Bad request');
        }

        $mixinNames = (array) $post->mixins;
        if (!$mixinNames || empty($mixinNames)) {
            return $this->Finish(400, 'Bad request');
        }

        foreach ($mixinNames as $mixinName) {
            foreach ($theme->mixins as $index => $mixin) {
                if ($mixin->name == $mixinName) {
                    $theme->mixins->DeleteAt($index);
                }
            }
        }

        if (!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }

        $themeArray = $theme->ToArray(true);
        return $this->Finish(200, 'ok', $themeArray);
    }

}