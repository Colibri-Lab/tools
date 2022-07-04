<?php

namespace App\Modules\Tools\Models;

# region Uses:
use Colibri\Data\Storages\Fields\DateTimeField;
use Colibri\Data\Storages\Fields\ArrayField;
# endregion Uses;
use Colibri\Data\Storages\Models\DataRow as BaseModelDataRow;

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


}