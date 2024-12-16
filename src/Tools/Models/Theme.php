<?php

namespace App\Modules\Tools\Models;

# region Uses:
use App\Modules\Tools\Models\Fields\Themes\MixinsArrayField;
use App\Modules\Tools\Models\Fields\Themes\VarsArrayField;
use Colibri\Data\Storages\Fields\ArrayField;
use Colibri\Data\Storages\Fields\DateTimeField;
# endregion Uses;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;
use Colibri\App;
use Colibri\Common\VariableHelper;
use Colibri\IO\FileSystem\File;

/**
 * Представление строки в таблице в хранилище Темы
 * @author <author name and email>
 * @package App\Modules\Tools\Models
 *
 * region Properties:
 * @property int $id ID строки
 * @property DateTimeField $datecreated Дата создания строки
 * @property DateTimeField $datemodified Дата последнего обновления строки
 * @property DateTimeField $datedeleted Дата удаления строки (если включно мягкое удаление)
 * @property string|null $name Наименование
 * @property string|null $desc Описание темы
 * @property string|null $domain Ключ домена
 * @property bool|null $current Текущая
 * @property VarsArrayField|null $vars Переменные
 * @property MixinsArrayField|null $mixins Mixin-ы
 * endregion Properties;
 */
class Theme extends BaseModelDataRow
{
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
			'vars' => [  'oneOf' => [ VarsArrayField::JsonSchema, [ 'type' => 'null'] ] ],
			'mixins' => [  'oneOf' => [ MixinsArrayField::JsonSchema, [ 'type' => 'null'] ] ],
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
        if(File::Exists(
            App::$webRoot . $cachePath . $cacheName
        ) && $file->attributes->modified >= $this->datemodified->getTimestamp()) {
            return App::$webRoot . $cachePath . $cacheName;
        }

        $fileData = [];
        $fileData[] = '$theme: "'.$this->domain . '-' . $this->name.'";';
        foreach($this->mixins as $mixin) {
            $params = [];
            foreach($mixin->params as $param) {
                $params[] = $param->name;
            }
            $fileData[] = '@mixin '.$mixin->name.(!empty($params) ?
                '('.implode(', ', $params).')' : '').'{'."\n".$mixin->value."\n".'}';
        }

        foreach($this->vars as $var) {
            $fileData[] = '$'.$var->name.': '.$var->value.';';
        }

        File::Write(App::$webRoot . $cachePath . $cacheName, implode("\n", $fileData));
        return App::$webRoot . $cachePath . $cacheName;
    }

    public function Import(object $themeData): \Colibri\Data\SqlClient\QueryInfo|bool
    {

        $vars = [];
        foreach($themeData as $key => $data) {
            if($key === 'mixins') {
                $mixins = [];
                foreach($data as $mixinName => $mixinData) {
                    $mixins[] = (object)['name' => $mixinName, 'value' => VariableHelper::ToString($mixinData, ';'."\n", ': ', false), 'params' => []];
                }
                $this->mixins = $mixins;
            } elseif($key === 'vars') {
                foreach($data as $varKey => $var) {
                    if(strstr($var, '#') !== false || strstr($var, 'rgb') !== false) {
                        $vars[] = (object)['name' => $varKey, 'type' => 'color', 'value' => $var];
                    } else {
                        $vars[] = (object)['name' => $varKey, 'type' => 'value', 'value' => $var];
                    }
                }
            }
        }

        $this->vars = $vars;
        return $this->Save();

    }

}
