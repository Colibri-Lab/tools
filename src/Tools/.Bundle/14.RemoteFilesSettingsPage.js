App.Modules.Tools.RemoteFilesSettingsPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.RemoteFilesSettingsPage']);

        this.AddClass('app-remote-files-admin-page-component');

        this._drop = new Colibri.UI.FileDropManager(this.container);

        this._buckets = this.Children('split/buckets-pane/buckets');
        this._files = this.Children('split/data-pane/files');
        this._searchInput = this.Children('split/data-pane/search-pane/search-input');

        this._uploadFiles = this.Children('split/data-pane/buttons-pane/upload-file');
        this._deleteFile = this.Children('split/data-pane/buttons-pane/delete-file');

        this._buckets.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderBucketsContextMenu(event, args))
        this._buckets.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnBucketsContextMenu(event, args));        

        this._buckets.AddHandler('SelectionChanged', (event, args) => this.__bucketsSelectionChanged(event, args));

        this._files.AddHandler('ScrolledToBottom', (event, args) => this.__dataScrolledToBottom(event, args));
        this._files.AddHandler('SelectionChanged', (event, args) => this.__dataSelectionChanged(event, args));
        this._files.AddHandler('CheckChanged', (event, args) => this.__checkChangedOnData(event, args));
        this._files.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderDataContextMenu(event, args));
        this._files.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnDataContextMenu(event, args));        

        this._deleteFile.AddHandler('Clicked', (event, args) => this.__deleteDataButtonClicked(event, args));
        this._uploadFiles.AddHandler('FileChoosen', (event, args) => this.__addDataButtonClicked(event, args));

        this._searchInput.AddHandler(['Filled', 'Cleared'], (event, args) => this.__searchInputFilled(event, args));
        this._drop.AddHandler('FileDropped', (event, args) => this.__dropContainerFileDropped(event, args));

    }

    
    _loadDataPage(bucket, searchTerm, page) {
        this._filesCurrentPage = page;
        Tools.RemoteFiles(bucket, searchTerm, page, 20);
    }

    
    __searchInputFilled(event, args) {
        const selected = this._buckets.selected;
        if(!selected) {
            this._files.ClearAll(); 
            return;           
        }
        this._files.bucket = selected.tag;
        this._loadDataPage(selected?.tag, this._searchInput.value, 1);
    }

    __bucketsSelectionChanged(event, args) {

        const selection = this._buckets.selected;
        
        this._searchInput.enabled = selection != null;
        this._files.enabled = selection != null;
        this._files.UnselectAllRows();
        this._files.UncheckAllRows();
        this._uploadFiles.enabled = selection != null;
        this._deleteFile.enabled = false;

        this.__searchInputFilled(event, args);
        
    }

    __dataScrolledToBottom(event, args) {
        const selected = this._buckets.selected;
        this._loadDataPage(selected?.tag, this._searchInput.value, this._filesCurrentPage + 1);
    }

    __dataSelectionChanged(event, args) {
        const checked = this._files.checked;
        const selected = this._files.selected;
        this._deleteFile.enabled = checked.length > 0 || !!selected;
    }

    __checkChangedOnData(event, args) { 
        const checked = this._files.checked;
        const selected = this._files.selected;
        this._deleteFile.enabled = checked.length > 0 || !!selected;
    }

    __deleteDataButtonClicked(event, args) {
        const selection = this._buckets.selected;
        const bucket = selection?.tag;
        if(!bucket) {
            return;
        }
        if(this._files.checked.length == 0) {
            App.Confirm.Show('Удаление файлов из удаленного хранилища', 'Вы уверены, что хотите удалить выбранный файл?', 'Удалить!').then(() => {
                Tools.DeleteFilesFromRemote(bucket, [this._files.selected.value.guid]);
            });
        }
        else {
            App.Confirm.Show('Удаление файлов из удаленного хранилища', 'Вы уверены, что хотите удалить выбранные файлы?', 'Удалить!').then(() => {
                let ids = [];
                this._files.checked.forEach((row) => {
                    ids.push(row.value.guid);
                });
                Tools.DeleteFilesFromRemote(bucket, ids);
            });
        }
    }

    __addDataButtonClicked(event, args) {

        const selected = this._buckets.selected;
        if(!selected) {
            return;
        }
        const bucket = selected.tag;
        if(!bucket) {
            return ;
        }

        if(args.errors.length > 0) {
            for(const error of args.errors) {
                App.Notices.Add(new Colibri.UI.Notice(error.error));
            }
        }
        if(args.success.length > 0) {
            Tools.UploadFilesToRemote(bucket, args.success);
        }
            

    }

    __dropContainerFileDropped(event, args) {
        const selected = this._buckets.selected;
        if(!selected) {
            return;
        }
        const bucket = selected.tag;
        if(!bucket) {
            return ;
        }

        if(args.errors.length > 0) {
            for(const error of args.errors) {
                App.Notices.Add(new Colibri.UI.Notice(error.error));
            }
        }
        if(args.success.length > 0) {
            Tools.UploadFilesToRemote(bucket, args.success);
        }

    }


    __renderDataContextMenu(event, args) {
        let contextmenu = [];
        
        contextmenu.push({name: 'remove-file', title: 'Удалить', icon: Colibri.UI.ContextMenuRemoveIcon});

        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left bottom', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        
    }

    __clickOnDataContextMenu(event, args) {

        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }
        
        if(menuData.name == 'remove-file') {
            this._deleteFile.Dispatch('Clicked');
        }
    }

    __renderBucketsContextMenu(event, args) {
        
        let contextmenu = [];
        
        const itemData = args.item?.value;
        if(!itemData) {
            contextmenu.push({name: 'new-bucket', title: 'Новая корзина', icon: Colibri.UI.ContextMenuAddIcon});

            this._buckets.contextmenu = contextmenu;
            this._buckets.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left top', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);

        }
        else {
            contextmenu.push({name: 'remove-bucket', title: 'Удалить корзину', icon: Colibri.UI.ContextMenuRemoveIcon});

            args.item.contextmenu = contextmenu;
            args.item.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left bottom', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }
    }

    __clickOnBucketsContextMenu(event, args) {

        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }
        
        if(menuData.name == 'new-bucket') {
            App.Prompt.Show('Создание корзины', {
                name: {
                    type: 'varchar',
                    component: 'Text',
                    default: item.value.name,
                    desc: 'Название корзины',
                    note: 'Введите название корзины',
                    params: {
                        validate: [{
                            message: 'Пожалуйста, введите название корзины!',
                            method: '(field, validator) => !!field.value'
                        }]
                    }
                }
            }, 'Сохранить').then((data) => {
                Tools.CreateBucket(data.name);
            }).catch(e => console.log(e));
        }
        else if(menuData.name == 'remove-bucket') {
            App.Confirm.Show('Удаление корзины', 'Вы уверены, что хотите удалить корзину? Все файлы внутри корзины будут удалены физически!', 'Удалить!').then(() => {
                Tools.RemoveBucket(item.tag);
                this._buckets.selected = null;
            });
        }

    }

}