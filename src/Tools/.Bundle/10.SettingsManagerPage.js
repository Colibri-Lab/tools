App.Modules.Tools.SettingsManagerPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.SettingsManagerPage']);

        this.AddClass('app-tools-settings-manager-page-component');

        this._settings = this.Children('split/settings-pane/settings');
        this._form = this.Children('split/data-pane/editor-pane/editor');
        this._save = this.Children('split/data-pane/buttons-pane/save');

        this._settings.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderSettingsContextMenu(event, args))
        this._settings.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnSettingsContextMenu(event, args));     
        this._settings.AddHandler('SelectionChanged', (event, args) => this.__settingsSelectionChanged(event, args));      
        this._settings.AddHandler('NodeEditCompleted', (event, args) => this.__settingsNodeEditCompleted(event, args));
        this._save.AddHandler('Clicked', (event, args) => this.__saveClicked(event, args));
    }

    __renderSettingsContextMenu(event, args) {

        const itemData = args.item?.tag;
        if(!itemData) {
            Manage.Store.AsyncQuery('manage.storages(settings)').then((settings) => {
                let contextmenu = [];
                settings.fields.type.values.forEach((type) => {
                    contextmenu.push({name: type.value, title: (type.title[Lang.Current] ?? type.title), icon: eval(type.icon)});
                });
                this._settings.contextmenu = contextmenu;
                this._settings.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left top', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
            });
        }
        else {
            let contextmenu = [];
            contextmenu.push({name: 'remove-setting', title: '#{tools-settings-contextmenu-delete}', icon: Colibri.UI.ContextMenuRemoveIcon});
            args.item.contextmenu = contextmenu;
            args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.LB], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }

        
    }

    __clickOnSettingsContextMenu(event, args) {
        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }

        if(menuData.name == 'remove-setting') {
            const setting = item.tag;
            this._settings.selected = null;
            Tools.DeleteSetting(setting.id);
        }
        else if(item instanceof Colibri.UI.Tree) {
            Manage.Store.AsyncQuery('manage.storages(settings)').then((settings) => {
                let type = null;
                settings.fields.type.values.forEach(v => {
                    if(v.value == menuData.name) {
                        type = v;
                        return false;
                    }
                    return true;
                });

                const node = this._settings.AddNew('UNTITLED', type, {new: true, type: type});
                node.editable = true;
                node.Edit();

            });

        }

    }

    __settingsNodeEditCompleted(event, args) {

        const node = args.node;
        const mode = args.mode;
        const value = args.value;
        if(node.tag?.new) {
            // добавляем
            node.Dispose();
            if(mode == 'save') {
                Tools.SaveSetting({type: node.tag.type, name: value, desc: '', value: ''});
            }
            return true;
        }
        else {
            // редактируем существующее
            node.tag.name = value;
            Tools.SaveSetting(node.tag);

        }

    }

    __settingsSelectionChanged(event, args) {

        const selection = this._settings.selected;
        if(!selection || selection.name === 'root') {
            this._form.fields = {};
            this._form.value = {};
            return false;
        }

        const setting = selection.tag;
        if(setting?.new) {
            return false;
        }
        let params = {};
        let component = 'Text';
        switch(setting.type.value) {
            case 'integer': { 
                component = 'Number';
                params = {
                    mask: '/^\d+$/'
                }
                break;
            }
            case 'double': { 
                component = 'Number';
                params = {
                    mask: '/^\d+,?\d+$/'
                }
                break;
            }
            default:
            case 'text': { 
                component = 'Text';
                break;
            }
            case 'textarea': { 
                component = 'TextArea';
                break;
            }
            case 'html': { 
                component = 'App.Modules.Manage.UI.TinyMCETextArea';
                params = {
                    visual: true
                }
                break;
            }
            case 'htmlcode': { 
                component = 'App.Modules.Manage.UI.TinyMCETextArea';
                params = {
                    code: 'html'
                }
                break;
            }
            case 'file': { 
                component = 'File';
                params = {
                    droparea: true
                }
                break;
            }
            case 'files': { 
                component = 'Files';
                params = {
                    droparea: true
                }
                break;
            }
            
        }

        this._form.fields = {
            desc: {
                type: 'varchar',
                component: 'Text',
                default: '',
                desc: '#{tools-settings-description-title}'
            },
            value: {
                type: 'varchar',
                component: component,
                params: params,
                desc: '#{tools-settings-value-title}'
            }
        }

        this._form.value = {
            desc: setting.desc,
            value: setting.value
        }

    }

    __saveClicked(event, args) {

        const selection = this._settings.selected;
        if(!selection || selection.name === 'root') {
            this._form.fields = {};
            this._form.value = {};
            return false;
        }

        const setting = selection.tag;
        if(setting?.new) {
            return false;
        }

        const data = this._form.value;
        setting.value = data.value;
        setting.desc = data.desc;
        Tools.SaveSetting(setting);
        
    }

    

}