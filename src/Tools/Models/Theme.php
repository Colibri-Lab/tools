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
 * Представление строки в таблице в хранилище Темы
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 * 
 * region Properties:
 * @property-read int $id ID строки
 * @property-read DateTimeField $datecreated Дата создания строки
 * @property-read DateTimeField $datemodified Дата последнего обновления строки
 * @property string|null $name Наименование
 * @property string|null $desc Описание темы
 * @property string|null $domain Ключ домена
 * @property bool|null $current Текущая
 * @property ArrayField|null $vars Переменные
 * @property ArrayField|null $mixins Mixin-ы
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
			'name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'desc' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'domain' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],
			'current' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => ['boolean','number'], 'enum' => [true, false, 0, 1],] ] ],
			'vars' => ['type' => 'array', 'items' => ['type' => 'object', 'required' => [], 'properties' => ['name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],'type' => [  'oneOf' => [ [ 'type' => 'null' ], ['type' => 'string', 'enum' => ['color', 'font-family', 'size', 'image', 'border', 'shadow']] ] ],'value' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],]]],
			'mixins' => ['type' => 'array', 'items' => ['type' => 'object', 'required' => [], 'properties' => ['name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],'params' => ['type' => 'array', 'items' => ['type' => 'object', 'required' => [], 'properties' => ['name' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 255, ] ] ],]]],'value' => [ 'oneOf' => [ [ 'type' => 'null'], ['type' => 'string', 'maxLength' => 1024, ] ] ],]]],
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