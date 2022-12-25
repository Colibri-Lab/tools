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
        this._domainsAndThemes.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnThemesContextMenu(event, args));     

        this._domainsAndThemes.AddHandler(['SelectionChanged', 'NodesLoaded'], (event, args) => this.__themesSelectionChanged(event, args));
        this._domainsAndThemes.AddHandler('NodeEditCompleted', (event, args) => this.__themesNodeEditCompleted(event, args));
        this._domainsAndThemes.AddHandler('DoubleClicked', (event, args) => this.__themesNodeDoubleClicked(event, args));

        this._varsGrid.AddHandler(['SelectionChanged', 'CheckChanged'], (event, args) => this.__varsSelectionChagned(event, args));
        this._mixinsGrid.AddHandler(['SelectionChanged', 'CheckChanged'], (event, args) => this.__mixinsSelectionChagned(event, args));

        this._varsGrid.AddHandler('DoubleClicked', (event, args) => this.__varsDoubleClicked(event, args));
        this._mixinsGrid.AddHandler('DoubleClicked', (event, args) => this.__mixinsDoubleClicked(event, args));

        this._addVarButton.AddHandler('Clicked', (event, args) => this.__addVarButtonClicked(event, args));
        this._editVarButton.AddHandler('Clicked', (event, args) => this.__editVarButtonClicked(event, args));
        this._deleteVarButton.AddHandler('Clicked', (event, args) => this.__deleteVarButtonClicked(event, args));

        this._addMixinButton.AddHandler('Clicked', (event, args) => this.__addMixinButtonClicked(event, args));
        this._editMixinButton.AddHandler('Clicked', (event, args) => this.__editMixinButtonClicked(event, args));
        this._deleteMixinButton.AddHandler('Clicked', (event, args) => this.__deleteMixinButtonClicked(event, args));


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


    __varsSelectionChagned(event, args) {
        this._enableControls();
    }

    __mixinsSelectionChagned(event, args) {
        this._enableControls();
    }

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
            if(itemData.data.current == 0) {
                contextmenu.push({name: 'separator'});
                contextmenu.push({name: 'set-current', title: '#{tools-themes-contextmenu-setcurrent}', icon: Colibri.UI.SelectCheckIcon});
            }
        }

        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.LB], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);

    }

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
            App.Confirm.Show('#{tools-themes-deletetheme}', '#{tools-themes-deletethememessage}', '#{app-confirm-buttons-delete;Удалить!}').then(() => {
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
            App.Confirm.Show('#{tools-themes-setcurrenttheme}', '#{tools-themes-setcurrentthememessage}', '#{app-confirm-ok;Продолжить}').then(() => {
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
                storage.fields.vars.component = 'Hidden';
                storage.fields.mixins.component = 'Hidden';
                storage.fields.current.component = 'Hidden';
                storage.fields.domain.component = 'Hidden';
                Manage.FormWindow.Show('#{tools-themes-windowtitle-edittheme}', 450, storage, data)
                    .then((data) => {
                        Tools.CreateTheme(data);
                    })
                    .catch(() => {});

            });
        }

    }

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
                        console.log('changed');
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
            console.log(fields);
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

    __deleteVarButtonClicked(event, args) {
        const theme = this._domainsAndThemes.selected?.tag?.data;
        const selectedVar = this._varsGrid.selected;
        const checkedVars = this._varsGrid.checked;
        if(checkedVars.length > 0) {
            App.Confirm.Show('#{tools-themes-deletevars}', '#{tools-themes-deletevarsmessage}', '#{app-confirm-buttons-delete;Удалить!}').then(() => {
                let names = [];
                checkedVars.forEach(variable => {
                    names.push(variable.value.name);
                });
                Tools.DeleteThemeVars(theme?.id, names);
            });    
        }
        else {
            App.Confirm.Show('#{tools-themes-deletevar}', '#{tools-themes-deletevarmessage}', '#{app-confirm-buttons-delete;Удалить!}').then(() => {
                Tools.DeleteThemeVars(theme?.id, [selectedVar.value.name]);
            });    
        }
    }

    __varsDoubleClicked(event, args) {
        this.__editVarButtonClicked(event, args);
    }

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

    __deleteMixinButtonClicked(event, args) {
        const theme = this._domainsAndThemes.selected?.tag?.data;
        const selectedMixin = this._mixinsGrid.selected;
        const checkedMixins = this._mixinsGrid.checked;
        if(checkedMixins.length > 0) {
            App.Confirm.Show('#{tools-themes-deletemixins}', '#{tools-themes-deletemixinsmessage}', '#{app-confirm-buttons-delete;Удалить!}').then(() => {
                let names = [];
                checkedMixins.forEach(mixin => {
                    names.push(mixin.value.name);
                });
                Tools.DeleteThemeMixins(theme?.id, names);
            });    
        }
        else {
            App.Confirm.Show('#{tools-themes-deletemixin}', '#{tools-themes-deletemixinmessage}', '#{app-confirm-buttons-delete;Удалить!}').then(() => {
                Tools.DeleteThemeMixins(theme?.id, [selectedMixin.value.name]);
            });    
        }
    }

    
    __mixinsDoubleClicked(event, args) {
        this.__editMixinButtonClicked(event, args);
    }

}
