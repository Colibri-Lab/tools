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
 * @property string|null $desc #{tools-storages-themes-fields-desc-desc;Описание темы}
 * @property string|null $domain #{tools-storages-themes-fields-domain-desc;Ключ домена}
 * @property bool|null $current #{tools-storages-themes-fields-current-desc;Текущая}
 * @property ArrayField|null $vars #{tools-storages-themes-fields-vars-desc;Переменные}
 * @property ArrayField|null $mixins #{tools-storages-themes-fields-mixins-desc;Mixin-ы}
 * endregion Properties;
 */
class Theme extends BaseModelDataRow {
    
    public const JsonSchema = [
        'type' => 'object',
        'required' => [
            'id',
            'datecreated',
            'datemodified',
            # region SchemaRequired:

			# endregion SchemaRequired;
        ],
        'properties' => [
            'id' => ['type' => 'integer'],
            'datecreated' => ['type' => 'string', 'format' => 'db-date-time'],
            'datemodified' => ['type' => 'string', 'format' => 'db-date-time'],
            # region SchemaProperties:
			'name' => ['type' => ['string', 'null'], 'maxLength' => 255],
			'desc' => ['type' => ['string', 'null'], 'maxLength' => 255],
			'domain' => ['type' => ['string', 'null'], 'maxLength' => 255],
			'current' => ['type' => ['boolean', 'null'], ],
			'vars' => ['type' => 'array', 'items' => ['type' => 'object', 'required' => [], 'properties' => ['name' => ['type' => ['string', 'null'], 'maxLength' => 255],'type' => ['type' => ['string', 'null'], 'enum' => ['color', 'font-family', 'size', 'image', 'border', 'shadow'],'maxLength' => 255],'value' => ['type' => ['string', 'null'], 'maxLength' => 255],]]],
			'mixins' => ['type' => 'array', 'items' => ['type' => 'object', 'required' => [], 'properties' => ['name' => ['type' => ['string', 'null'], 'maxLength' => 255],'params' => ['type' => 'array', 'items' => ['type' => 'object', 'required' => [], 'properties' => ['name' => ['type' => ['string', 'null'], 'maxLength' => 255],]]],'value' => ['type' => ['string', 'null'], 'maxLength' => 1024],]]],
			# endregion SchemaProperties;
        ]
    ];

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
        $fileData[] = '$theme: "'.$this->domain . '-' . $this->name.'";';
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