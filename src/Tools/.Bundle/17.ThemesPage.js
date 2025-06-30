App.Modules.Tools.ThemesPage = class extends Colibri.UI.Component 
{
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.ThemesPage']);

        this.AddClass('app-themes-page-component');

        this._domainsAndThemes = this.Children('split/themes-pane/themes');
        this._varsGrid = this.Children('split/vars-pane/vars/vars');
        this._mixinsGrid = this.Children('split/vars-pane/mixins/mixins');
        
        this._addVarButton = this.Children('split/vars-pane/vars/buttons-pane/add-data');
        this._editVarButton = this.Children('split/vars-pane/vars/buttons-pane/edit-data');
        this._deleteVarButton = this.Children('split/vars-pane/vars/buttons-pane/delete-data');

        this._addMixinButton = this.Children('split/vars-pane/mixins/buttons-pane/add-data');
        this._editMixinButton = this.Children('split/vars-pane/mixins/buttons-pane/edit-data');
        this._deleteMixinButton = this.Children('split/vars-pane/mixins/buttons-pane/delete-data');

        this._domainsAndThemes.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderThemesContextMenu(event, args))
        this._domainsAndThemes.AddHandler('ContextMenuItemClicked', this.__clickOnThemesContextMenu, false, this);     

        this._domainsAndThemes.AddHandler(['SelectionChanged', 'NodesLoaded'], this.__themesSelectionChanged, false, this);
        this._domainsAndThemes.AddHandler('NodeEditCompleted', this.__themesNodeEditCompleted, false, this);
        this._domainsAndThemes.AddHandler('DoubleClicked', this.__themesNodeDoubleClicked, false, this);

        this._varsGrid.AddHandler(['SelectionChanged', 'CheckChanged'], this.__varsSelectionChagned, false, this);
        this._mixinsGrid.AddHandler(['SelectionChanged', 'CheckChanged'], this.__mixinsSelectionChagned, false, this);

        this._varsGrid.AddHandler('DoubleClicked', this.__varsDoubleClicked, false, this);
        this._mixinsGrid.AddHandler('DoubleClicked', this.__mixinsDoubleClicked, false, this);

        this._addVarButton.AddHandler('Clicked', this.__addVarButtonClicked, false, this);
        this._editVarButton.AddHandler('Clicked', this.__editVarButtonClicked, false, this);
        this._deleteVarButton.AddHandler('Clicked', this.__deleteVarButtonClicked, false, this);

        this._addMixinButton.AddHandler('Clicked', this.__addMixinButtonClicked, false, this);
        this._editMixinButton.AddHandler('Clicked', this.__editMixinButtonClicked, false, this);
        this._deleteMixinButton.AddHandler('Clicked', this.__deleteMixinButtonClicked, false, this);


    }

    _enableControls() { 
        const selected = this._domainsAndThemes?.selected;
        const selectedVar = this._varsGrid.selected;
        const checkedVars = this._varsGrid.checked;
        const selectedMixin = this._mixinsGrid.selected;
        const checkedMixins = this._mixinsGrid.checked;
        
        this._varsGrid.enabled = selected && selected.tag.type == 'theme';
        this._mixinsGrid.enabled = selected && selected.tag.type == 'theme';
        
        this._addVarButton.enabled = selected && selected.tag.type == 'theme';
        this._editVarButton.enabled = selected && selected.tag.type == 'theme' && (!!selectedVar || checkedVars.length == 1);
        this._deleteVarButton.enabled = selected && selected.tag.type == 'theme' && (!!selectedVar || checkedVars.length > 0);

        this._addMixinButton.enabled = selected && selected.tag.type == 'theme';
        this._editMixinButton.enabled = selected && selected.tag.type == 'theme' && (!!selectedMixin || checkedMixins.length == 1);
        this._deleteMixinButton.enabled = selected && selected.tag.type == 'theme' && (!!selectedMixin || checkedMixins.length > 0);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __themesSelectionChanged(event, args) {
        const selected = this._domainsAndThemes?.selected;
        if(selected && selected.tag.type == 'theme') {
            const selectedTheme = selected.tag.data;
            this._showVarsAndMixins(selectedTheme);
        }
        else {
            this._varsGrid.ClearAllRows();
            this._mixinsGrid.ClearAllRows();
        }

        this._enableControls();
    }   


    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __varsSelectionChagned(event, args) {
        this._enableControls();
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __mixinsSelectionChagned(event, args) {
        this._enableControls();
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __themesNodeEditCompleted(event, args) {
        const node = args.node;
        const mode = args.mode;
        const value = args.value;
        if(node.tag?.new) {
            const domainNode = node.parentNode;
            // добавляем
            node.Dispose();
            if(mode == 'save') {
                Tools.CreateTheme({name: value, domain: domainNode.tag.data.value});
            }
            return true;
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __renderThemesContextMenu(event, args) {
        let contextmenu = [];

        const itemData = args.item?.tag;
        if(!itemData) {
            return;
        }

        if(itemData.type == 'domain') {
            contextmenu.push({name: 'new-theme', title: '#{tools-themes-contextmenu-newtheme}', icon: Colibri.UI.ContextMenuAddIcon});
        }
        else {
            contextmenu.push({name: 'edit-theme', title: '#{tools-themes-contextmenu-edittheme}', icon: Colibri.UI.ContextMenuEditIcon});
            contextmenu.push({name: 'remove-theme', title: '#{tools-themes-contextmenu-deletetheme}', icon: Colibri.UI.ContextMenuRemoveIcon});
            contextmenu.push({name: 'separator'});
            contextmenu.push({name: 'dublicate-theme', title: '#{tools-themes-contextmenu-dublicatetheme}', icon: Colibri.UI.ContextMenuDublicateIcon});
            contextmenu.push({name: 'import-theme', title: '#{tools-themes-contextmenu-importtheme}', icon: Colibri.UI.ImportIcon});
            if(itemData.data.current == 0) {
                contextmenu.push({name: 'separator'});
                contextmenu.push({name: 'set-current', title: '#{tools-themes-contextmenu-setcurrent}', icon: Colibri.UI.SelectCheckIcon});
            }
        }

        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clickOnThemesContextMenu(event, args) {
        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }

        if(menuData.name == 'edit-theme') {
            const theme = item.tag;
            Manage.Store.AsyncQuery('manage.storages(themes)').then(storage => {
                storage = Object.cloneRecursive(storage);
                delete storage.fields.vars;
                delete storage.fields.mixins;
                delete storage.fields.current;
                delete storage.fields.domain;

                const fields = storage.fields;

                Manage.FormWindow.Show('#{tools-themes-windowtitle-edittheme}', 450, storage, theme.data)
                    .then((data) => {
                        Tools.CreateTheme(data);
                    })
                    .catch(() => {});

            });
        }
        else if(menuData.name == 'remove-theme') {
            const theme = item.tag.data;
            this._domainsAndThemes.selected = null;
            App.Confirm.Show(
                '#{tools-themes-deletetheme}',
                '#{tools-themes-deletethememessage}',
                '#{tools-themes-deletethememessage-delete}'
            ).then(() => {
                Tools.DeleteTheme(theme.id);
            });
        }
        else if(menuData.name == 'new-theme') {
            const node = this._domainsAndThemes.AddNew(item, 'UNTITLED', {new: true, name: 'UNTITLED'});
            node.editable = true;
            node.Edit();
        }
        else if(menuData.name == 'set-current') {
            const theme = item.tag.data;
            App.Confirm.Show(
                '#{tools-themes-setcurrenttheme}',
                '#{tools-themes-setcurrentthememessage}',
                '#{tools-themes-setcurrentthememessage-ok}'
            ).then(() => {
                Tools.SetThemeAsCurrent(theme.id);
            });
        }
        else if(menuData.name == 'dublicate-theme') {
            const theme = item.tag;
            let data = Object.cloneRecursive(theme.data);
            data.name = 'dublicated-theme';
            data.current = 0;
            delete data.id;
            Manage.Store.AsyncQuery('manage.storages(themes)').then(storage => {
                storage = Object.cloneRecursive(storage);
                storage.fields.vars.component = 'Colibri.UI.Forms.Hidden';
                storage.fields.mixins.component = 'Colibri.UI.Forms.Hidden';
                storage.fields.current.component = 'Colibri.UI.Forms.Hidden';
                storage.fields.domain.component = 'Colibri.UI.Forms.Hidden';
                Manage.FormWindow.Show('#{tools-themes-windowtitle-edittheme}', 450, storage, data)
                    .then((data) => {
                        Tools.CreateTheme(data);
                    })
                    .catch(() => {});

            });
        } 
        else if(menuData.name == 'import-theme') {
            const theme = item.tag;
            Manage.FormWindow.Show('#{tools-themes-windowtitle-importtheme}', 750, {
                name: 'import',
                fields: {
                    json_data: {
                        component: 'TextArea',
                        desc: '#{tools-themes-windowtitle-importtheme-fields-json_data}',
                    }
                }
            }, {id: theme.data.id})
                .then((data) => {
                    Tools.ImportTheme(data);
                })
                .catch(() => {});
        }

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __themesNodeDoubleClicked(event, args) {
        const theme = this._domainsAndThemes.selected?.tag;
        if(!theme) {
            return;
        }
        
        if(theme.type == 'domain') {
            const node = this._domainsAndThemes.AddNew(this._domainsAndThemes.selected, 'UNTITLED', {new: true, name: 'UNTITLED'});
            node.editable = true;
            node.Edit();
            
        }
        else {
            Manage.Store.AsyncQuery('manage.storages(themes)').then(storage => {
                storage = Object.cloneRecursive(storage);
                delete storage.fields.vars;
                delete storage.fields.mixins;
                delete storage.fields.current;
                delete storage.fields.domain;

                Manage.FormWindow.Show('#{tools-themes-windowtitle-edittheme}', 450, storage, theme.data)
                    .then((data) => {
                        Tools.CreateTheme(data);
                    })
                    .catch(() => {});

            });
        }

    }

    _showVarsAndMixins(selectedTheme) {
        this._varsGrid.binding = selectedTheme.vars ?? [];
        this._mixinsGrid.binding = selectedTheme.mixins ?? [];
    }

    _getValueField(fields, value) {
        fields.fields.value.params.readonly = false;
        if(value === 'color') {
            fields.fields.value.component = 'Color';
        }
        else if(value === 'border') {
            fields.fields.value.component = 'Text';
        }
        else if(value === 'font-family') {
            fields.fields.value.component = 'FontFamily';
            fields.fields.value.params.readonly = true;
        }
        else if(value === 'size') {
            fields.fields.value.component = 'Text';
        }
        else if(value === 'image') {
            fields.fields.value.component = 'App.Modules.Manage.UI.File';
        }
        else if(value === 'shadow') {
            fields.fields.value.component = 'Text';
        }

        fields.fields.value.params.enabled = true;
        return fields;
    }
    
    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __addVarButtonClicked(event, args) {
        const theme = this._domainsAndThemes.selected?.tag?.data;
        Manage.Store.AsyncQuery('manage.storages(themes)').then(storage => {
            let fields = storage.fields.vars;
            fields.fields.name.params.enabled = true;
            fields.fields.value.params.enabled = false;
            Manage.FormWindow.Show('#{tools-themes-windowtitle-addvartitle}', 450, fields, {}, '', {
                type: {
                    event: 'Changed',
                    handler: (event, args) => {
                        const form = event.sender.root;
                        const values = form.value;
                        const typeComponent = args?.component;
                        const value = typeComponent?.value;
                        if(value) {
                            fields = this._getValueField(fields, value);
                            Manage.FormWindow.ReCreateForm(fields.fields, values);
                        }

                    }
                }
            })
                .then((data) => {
                    Tools.SaveThemeVar(theme.id, data);
                })
                .catch(() => {});

        });
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __editVarButtonClicked(event, args) {
        let selected = this._varsGrid.selected;
        if(!selected) {
            selected = this._varsGrid.checked[0];
        }
        const theme = this._domainsAndThemes.selected?.tag?.data;

        Manage.Store.AsyncQuery('manage.storages(themes)').then(storage => {
            let fields = storage.fields.vars;
            const values = selected.value;
            fields.fields.name.params.enabled = false;
            fields.fields.value.params.enabled = false;
            fields = this._getValueField(fields, values['type']);
            Manage.FormWindow.Show('#{tools-themes-windowtitle-editvartitle}', 450, fields, values, '', {
                type: {
                    event: 'Changed',
                    handler: (event, args) => {
                        const form = event.sender.root;
                        const values = form.value;
                        const typeComponent = args?.component;
                        const value = typeComponent?.value;
                        if(value) {
                            fields = this._getValueField(fields, value);
                            Colibri.Common.Delay(500).then(() => {
                                Manage.FormWindow.ReCreateForm(fields.fields, values);
                            });
                        }

                    }
                }
            })
            .then((data) => {
                Tools.SaveThemeVar(theme.id, data);
            })
            .catch(() => {});

        });
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __deleteVarButtonClicked(event, args) {
        const theme = this._domainsAndThemes.selected?.tag?.data;
        const selectedVar = this._varsGrid.selected;
        const checkedVars = this._varsGrid.checked;
        if(checkedVars.length > 0) {
            App.Confirm.Show(
                '#{tools-themes-deletevars}',
                '#{tools-themes-deletevarsmessage}',
                '#{tools-themes-deletevarsmessage-delete}'
            ).then(() => {
                let names = [];
                checkedVars.forEach(variable => {
                    names.push(variable.value.name);
                });
                Tools.DeleteThemeVars(theme?.id, names);
            });    
        }
        else {
            App.Confirm.Show(
                '#{tools-themes-deletevar}',
                '#{tools-themes-deletevarmessage}',
                '#{tools-themes-deletevarmessage-delete}'
            ).then(() => {
                Tools.DeleteThemeVars(theme?.id, [selectedVar.value.name]);
            });    
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __varsDoubleClicked(event, args) {
        this.__editVarButtonClicked(event, args);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __addMixinButtonClicked(event, args) {
        const theme = this._domainsAndThemes.selected?.tag?.data;
        Manage.Store.AsyncQuery('manage.storages(themes)').then(storage => {
            let fields = storage.fields.mixins;
            fields.fields.name.params.enabled = true;
            Manage.FormWindow.Show('#{tools-themes-windowtitle-addmixintitle}', 650, fields, {})
                .then((data) => {
                    Tools.SaveThemeMixin(theme.id, data);
                })
                .catch(() => {});

        });
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __editMixinButtonClicked(event, args) {
        let selected = this._mixinsGrid.selected;
        if(!selected) {
            selected = this._mixinsGrid.checked[0];
        }
        const theme = this._domainsAndThemes.selected?.tag?.data;

        Manage.Store.AsyncQuery('manage.storages(themes)').then(storage => {
            let fields = storage.fields.mixins;
            const values = selected.value;
            fields.fields.name.params.enabled = false;

            Manage.FormWindow.Show('#{tools-themes-windowtitle-editmixintitle}', 650, fields, values)
                .then((data) => {
                    Tools.SaveThemeMixin(theme.id, data);
                })
                .catch(() => {});

        });
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __deleteMixinButtonClicked(event, args) {
        const theme = this._domainsAndThemes.selected?.tag?.data;
        const selectedMixin = this._mixinsGrid.selected;
        const checkedMixins = this._mixinsGrid.checked;
        if(checkedMixins.length > 0) {
            App.Confirm.Show('#{tools-themes-deletemixins}', '#{tools-themes-deletemixinsmessage}', '#{tools-themes-deletemixinsmessage-delete}').then(() => {
                let names = [];
                checkedMixins.forEach(mixin => {
                    names.push(mixin.value.name);
                });
                Tools.DeleteThemeMixins(theme?.id, names);
            });    
        }
        else {
            App.Confirm.Show('#{tools-themes-deletemixin}', '#{tools-themes-deletemixinmessage}', '#{tools-themes-deletemixinmessage-delete}').then(() => {
                Tools.DeleteThemeMixins(theme?.id, [selectedMixin.value.name]);
            });    
        }
    }

    
    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __mixinsDoubleClicked(event, args) {
        this.__editMixinButtonClicked(event, args);
    }

}
