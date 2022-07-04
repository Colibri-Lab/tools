<?php

namespace App\Modules\Tools\Controllers;

use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use App\Modules\Security\Module as SecurityModule;
use App\Modules\Tools\Models\Settings;
use App\Modules\Tools\Models\Backups;
use Colibri\App;
use Colibri\Common\NoLangHelper;
use App\Modules\Tools\Cron\Manager;
use App\Modules\Tools\Models\Backup;
use App\Modules\Tools\Threading\BackupWorker;
use Colibri\Threading\Process;
use App\Modules\Tools\Models\Themes;

class ThemesController extends WebController
{
    public function List(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.backups')) {
            return $this->Finish(403, 'Permission denied');
        }

        $themes = Themes::LoadAll();
        $themesArray = [];
        foreach($themes as $theme) {
            $themeArray = $theme->ToArray(true);
            if(App::$moduleManager->lang) {
                $themeArray = App::$moduleManager->lang->ParseArray($themeArray);
            }
            else {
                $themeArray = NoLangHelper::ParseArray($themeArray);
            }
            $themesArray[] = $themeArray;
        }
        return $this->Finish(200, 'ok', $themesArray);
    }

    public function Delete(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.backups.remove')) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->theme;
        if(!$id) {
            return $this->Finish(400, 'Bad request');
        }

        $theme = Themes::LoadById((int)$id);
        $theme->Delete();

        return $this->Finish(200, 'ok');


    }

    public function Save(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;
        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.themes' . ($id ? '.edit' : '.add'))) {
            return $this->Finish(403, 'Permission denied');
        }

        if($id) {
            $theme = Themes::LoadById((int)$id);
        }
        else {
            $theme = Themes::LoadEmpty();
        }

        $theme->name = $post->name;
        $theme->domain = $post->domain;
        if(!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }
        
        $themeArray = $theme->ToArray(true);
        if(App::$moduleManager->lang) {
            $themeArray = App::$moduleManager->lang->ParseArray($themeArray);
        }
        else {
            $themeArray = NoLangHelper::ParseArray($themeArray);
        }

        return $this->Finish(200, 'ok', $themeArray);


    }

    public function SaveVar(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int)$id);
        if(!$theme) {
            return $this->Finish(400, 'Bad request');
        }

        $varObject = (object)$post->var;
        if(!$varObject) {
            return $this->Finish(400, 'Bad request');
        }

        $found = false;
        $vars = $theme->vars->ToArray();
        foreach($vars as $var) {
            if($var->name == $varObject->name) {
                // есть надо обновить
                $var->type = $varObject->type;
                $var->value = isset($varObject->value['value']) ? $varObject->value['value'] : $varObject->value;
                $found = true;
                break;
            }
        }

        if(!$found) {
            $vars[] = $varObject;
        }

        $theme->vars->Clear();
        $theme->vars->Append($vars);

        if(!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }
        
        $themeArray = $theme->ToArray(true);
        if(App::$moduleManager->lang) {
            $themeArray = App::$moduleManager->lang->ParseArray($themeArray);
        }
        else {
            $themeArray = NoLangHelper::ParseArray($themeArray);
        }

        return $this->Finish(200, 'ok', $themeArray);
    }   

    public function DeleteVars(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int)$id);
        if(!$theme) {
            return $this->Finish(400, 'Bad request');
        }

        $varNames = (array)$post->vars;
        if(!$varNames || empty($varNames)) {
            return $this->Finish(400, 'Bad request');
        }

        $newVars = [];
        $vars = $theme->vars->ToArray();
        foreach($vars as $var) {
            if(!in_array($var->name, $varNames)) {
                $newVars[] = $var;
            }
        }

        $theme->vars->Clear();
        $theme->vars->Append($newVars);

        if(!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }
        
        $themeArray = $theme->ToArray(true);
        if(App::$moduleManager->lang) {
            $themeArray = App::$moduleManager->lang->ParseArray($themeArray);
        }
        else {
            $themeArray = NoLangHelper::ParseArray($themeArray);
        }

        return $this->Finish(200, 'ok', $themeArray);
    }  

    public function SaveMixin(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int)$id);
        if(!$theme) {
            return $this->Finish(400, 'Bad request');
        }

        $mixinObject = (object)$post->mixin;
        if(!$mixinObject) {
            return $this->Finish(400, 'Bad request');
        }

        $found = false;
        $mixins = $theme->mixins->ToArray();
        foreach($mixins as $mixin) {
            if($mixin->name == $mixinObject->name) {
                // есть надо обновить
                $mixin->params = $mixinObject->params;
                $mixin->value = $mixinObject->value;
                $found = true;
                break;
            }
        }

        if(!$found) {
            $mixins[] = $mixinObject;
        }

        $theme->mixins->Clear();
        $theme->mixins->Append($mixins);

        if(!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }
        
        $themeArray = $theme->ToArray(true);
        if(App::$moduleManager->lang) {
            $themeArray = App::$moduleManager->lang->ParseArray($themeArray);
        }
        else {
            $themeArray = NoLangHelper::ParseArray($themeArray);
        }

        return $this->Finish(200, 'ok', $themeArray);
    }   

    public function DeleteMixins(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $id = $post->id;

        if(!SecurityModule::$instance->current->IsCommandAllowed('tools.themes.edit')) {
            return $this->Finish(403, 'Permission denied');
        }

        $theme = Themes::LoadById((int)$id);
        if(!$theme) {
            return $this->Finish(400, 'Bad request');
        }

        $mixinNames = (array)$post->mixins;
        if(!$mixinNames || empty($mixinNames)) {
            return $this->Finish(400, 'Bad request');
        }

        $newMixins = [];
        $mixins = $theme->mixins->ToArray();
        foreach($mixins as $mixin) {
            if(!in_array($mixin->name, $mixinNames)) {
                $newMixins[] = $mixin;
            }
        }

        $theme->mixins->Clear();
        $theme->mixins->Append($newMixins);

        if(!$theme->Save()) {
            return $this->Finish(400, 'Bad request');
        }
        
        $themeArray = $theme->ToArray(true);
        if(App::$moduleManager->lang) {
            $themeArray = App::$moduleManager->lang->ParseArray($themeArray);
        }
        else {
            $themeArray = NoLangHelper::ParseArray($themeArray);
        }

        return $this->Finish(200, 'ok', $themeArray);
    }

}