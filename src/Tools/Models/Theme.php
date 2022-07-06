<?php

namespace App\Modules\Tools\Models;

# region Uses:
use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Fields\ArrayField;
# endregion Uses;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;
use Colibri\App;
use Colibri\IO\FileSystem\File;

/**
 * Представление строки в таблице в хранилище #{tools-storages-themes-desc;Темы}
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * region Properties:
 * @property-read int $id ID строки
 * @property-read DateTimeField $datecreated Дата создания строки
 * @property-read DateTimeField $datemodified Дата последнего обновления строки
 * @property string|null $name #{tools-storages-themes-fields-name-desc;Наименование}
 * @property string|null $domain #{tools-storages-themes-fields-domain-desc;Ключ домена}
 * @property ArrayField|null $vars #{tools-storages-themes-fields-vars-desc;Переменные}
 * @property ArrayField|null $mixins #{tools-storages-themes-fields-mixins-desc;Mixin-ы}
 * endregion Properties;
 */
class Theme extends BaseModelDataRow {
    
    # region Consts:
    
    # endregion Consts;

    public function Generate(): string
    {
        $cachePath = 'res/themes/';
        $cacheName = $this->domain . '.' . $this->name . '.scss';

        $file = new File(App::$webRoot . $cachePath . $cacheName);
        if(File::Exists(App::$webRoot . $cachePath . $cacheName) && $file->attributes->modified >= $this->datemodified->getTimestamp()) {
            return App::$webRoot . $cachePath . $cacheName;
        }

        $fileData = [];
        $fileData[] = '$theme: "'.$this->name.'";';
        foreach($this->mixins as $mixin) {
            $params = [];
            foreach($mixin->params as $param) {
                $params[] = $param->name;
            }
            $fileData[] = '@mixin '.$mixin->name.(!empty($params) ? '('.implode(', ', $params).')' : '').'{'."\n".$mixin->value."\n".'}';
        }

        foreach($this->vars as $var) {
            $fileData[] = '$'.$var->name.': '.$var->value.';';
        }

        File::Write(App::$webRoot . $cachePath . $cacheName, implode("\n", $fileData));
        return App::$webRoot . $cachePath . $cacheName;
    }

}