App.Modules.Tools.SettingsDataPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.SettingsDataPage']);

        this.AddClass('app-tools-settings-data-page-component');

        this._settings = this.Children('split/settings-pane/settings');
        this._title = this.Children('split/data-pane/ttl');
        this._form = this.Children('split/data-pane/editor-pane/editor');
        this._save = this.Children('split/data-pane/buttons-pane/save');

        this._settings.AddHandler('SelectionChanged', (event, args) => this.__settingsSelectionChanged(event, args));      
        this._save.AddHandler('Clicked', (event, args) => this.__saveClicked(event, args));
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
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
            case 'date': { 
                component = 'Date';
                break;
            }
            case 'datetime': { 
                component = 'DateTime';
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

        this._title.value = setting.name + ' (' + (setting.desc ? setting.desc : '#{tools-settingsdata-title-nodesc}') + ')';
        this._form.fields = {
            value: {
                type: 'varchar',
                component: component,
                params: params,
                desc: '#{tools-settingsdata-value-title}'
            }
        }
        
        this._form.value = {
            value: setting.value
        }

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
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
        Tools.SaveSetting(setting);
        
    }

    

}