<?php

namespace App\Modules\Tools\Controllers;

use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Themes;
use Colibri\AppException;
use Colibri\Common\VariableHelper;
use Colibri\Exceptions\ApplicationErrorException;
use Colibri\Exceptions\BadRequestException;
use Colibri\Exceptions\PermissionDeniedException;
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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.backups')) {
            throw new PermissionDeniedException('Permission denied', 403);
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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.backups.remove')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'theme'};
        if (!$id) {
            throw new BadRequestException('Bad request', 400);
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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};
        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes' . ($id ? '.edit' : '.add'))) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if ($id) {
            $theme = Themes::LoadById((int) $id);
        } else {
            $theme = Themes::LoadEmpty();
        }

        $accessPoint = $theme->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $theme->name = $post->{'name'};
            $theme->domain = $post->{'domain'};
            $theme->desc = $post->{'desc'};
            $theme->current = $post->{'current'};
            $theme->vars = $post->{'vars'};
            $theme->mixins = $post->{'mixins'};

            if (($res = $theme->Save(true)) !== true) {
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

        $themeArray = $theme->ToArray(true);
        return $this->Finish(200, 'ok', $themeArray);

    }

    /**
     * Imports theme data from json
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @throws InvalidArgumentException
     * @return object
     */
    public function Import(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};
        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!$id) {
            return $this->Finish(404, 'Not found');
        }
        
        $theme = Themes::LoadById((int) $id);

        $accessPoint = $theme->Storage()->accessPoint;
        $accessPoint->Begin();

        try {

            $json_data = $post->{'json_data'};
            $json_data = json_decode($json_data);
            if(!$json_data) {
                throw new InvalidArgumentException('Invalid json data in request');
            }

            if(!$theme->Import($json_data)) {
                throw new AppException('Error importing theme data from JSON');
            }

            if (($res = $theme->Save(true)) !== true) {
                throw new AppException($res->error, 400);
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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};
        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            throw new BadRequestException('Bad request', 400);
        }


        $domainThemes = Themes::LoadByDomain($theme->domain);
        foreach ($domainThemes as $dtheme) {
            $dtheme->current = false;
            $dtheme->Save();
        }

        $theme->current = true;
        if (!$theme->Save()) {
            throw new BadRequestException('Bad request', 400);
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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            throw new BadRequestException('Bad request', 400);
        }

        $varObject = (object) $post->{'var'};
        if (!$varObject) {
            throw new BadRequestException('Bad request', 400);
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
            throw new BadRequestException('Bad request', 400);
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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            throw new BadRequestException('Bad request', 400);
        }

        $varNames = (array) $post->{'vars'};
        if (!$varNames || empty($varNames)) {
            throw new BadRequestException('Bad request', 400);
        }

        foreach ($varNames as $varName) {
            foreach ($theme->vars as $index => $var) {
                if ($var->name == $varName) {
                    $theme->vars->DeleteAt($index);
                }
            }
        }


        if (!$theme->Save()) {
            throw new BadRequestException('Bad request', 400);
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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            throw new BadRequestException('Bad request', 400);
        }

        $mixinObject = (object) $post->{'mixin'};
        if (!$mixinObject) {
            throw new BadRequestException('Bad request', 400);
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
            throw new BadRequestException('Bad request', 400);
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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $id = $post->{'id'};

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $theme = Themes::LoadById((int) $id);
        if (!$theme) {
            throw new BadRequestException('Bad request', 400);
        }

        $mixinNames = (array) $post->{'mixins'};
        if (!$mixinNames || empty($mixinNames)) {
            throw new BadRequestException('Bad request', 400);
        }

        foreach ($mixinNames as $mixinName) {
            foreach ($theme->mixins as $index => $mixin) {
                if ($mixin->name == $mixinName) {
                    $theme->mixins->DeleteAt($index);
                }
            }
        }

        if (!$theme->Save()) {
            throw new BadRequestException('Bad request', 400);
        }

        $themeArray = $theme->ToArray(true);
        return $this->Finish(200, 'ok', $themeArray);
    }

}