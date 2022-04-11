
App.Modules.Tools.UI.FileManager = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.UI.FileManager']);
        this.AddClass('app-file-manager-component');

        this._folders = this.Children('split/folders-pane/folders');
        this._searchInput = this.Children('split/files-pane/search-pane/search-input');
        this._files = this.Children('split/files-pane/files');
        
        this._uploadFile = this.Children('split/files-pane/buttons-pane/upload-file');
        this._editFile = this.Children('split/files-pane/buttons-pane/edit-file');
        this._deleteFile = this.Children('split/files-pane/buttons-pane/delete-file');

        this._folders.AddHandler('SelectionChanged', (event, args) => this.__foldersSelectionChanged(event, args));      
        this._folders.AddHandler('NodeEditCompleted', (event, args) => this.__foldersNodeEditCompleted(event, args));

        this._files.AddHandler('SelectionChanged', (event, args) => this.__filesSelectionChanged(event, args));      
        this._files.AddHandler('CheckChanged', (event, args) => this.__checkChangedOnFiles(event, args));

        this._folders.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderFoldersContextMenu(event, args))
        this._folders.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnFoldersContextMenu(event, args));        
        this._files.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderFilesContextMenu(event, args));
        this._files.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnFilesContextMenu(event, args));        

        // this._uploadData.AddHandler('Clicked', (event, args) => this.__addDataButtonClicked(event, args));
        // this._editData.AddHandler('Clicked', (event, args) => this.__editDataButtonClicked(event, args));
        // this._deleteFile.AddHandler('Clicked', (event, args) => this.__deleteDataButtonClicked(event, args));

    }
    
    _registerEvents() {
        this.RegisterEvent('SelectionChanged', false, 'Когда выбор файлов изменился');
    }

    __renderFoldersContextMenu(event, args) {
        let contextmenu = [];
        
        const itemData = args.item?.tag;
        if(!itemData) {
            contextmenu.push({name: 'new-folder', title: 'Новый раздел', icon: Colibri.UI.ContextMenuAddIcon});

            this._folders.contextmenu = contextmenu;
            this._folders.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left top', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);

        }
        else {
            contextmenu.push({name: 'new-folder', title: 'Новый раздел', icon: Colibri.UI.ContextMenuAddIcon});
            contextmenu.push({name: 'edit-folder', title: 'Редактировать раздел', icon: Colibri.UI.ContextMenuEditIcon});
            contextmenu.push({name: 'remove-folder', title: 'Удалить раздел', icon: Colibri.UI.ContextMenuRemoveIcon});

            args.item.contextmenu = contextmenu;
            args.item.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left bottom', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }
    }

    __clickOnFoldersContextMenu(event, args) {
        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }

        if(menuData.name == 'new-folder') {
            item.Expand();
            item.isLeaf = false;
            const node = this._folders.AddNew(item, 'UNTITLED', {new: true, name: 'UNTITLED', path: item.tag.path});
            node.editable = true;
            node.Edit();
        }
        else if(menuData.name == 'edit-folder') {
            item.Edit();
        }

    }

    __renderFilesContextMenu(event, args) {
        
        const itemData = args.item?.value;
        if(!itemData) {
            return;
        }

        let contextmenu = [];
        contextmenu.push({name: 'edit-file', title: 'Редактировать файл', icon: Colibri.UI.ContextMenuEditIcon});
        contextmenu.push({name: 'remove-file', title: 'Удалить файл', icon: Colibri.UI.ContextMenuRemoveIcon});
        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left bottom', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
    }

    __clickOnFilesContextMenu(event, args) {

    }

    __foldersNodeEditCompleted(event, args) {
        
        const node = args.node;
        const mode = args.mode;
        const value = args.value;
        const parentNode = node.parentNode;
        if(node.tag?.new) {
            // добавляем
            node.Dispose();
            if(mode == 'save') {
                Tools.CreateFolder(parentNode.tag.path + value + '/');
            }
            else {
                parentNode.isLeaf = parentNode.nodes.children == 0;
                if(parentNode.isLeaf) {
                    parentNode.Collapse();
                }
                this._folders.selected = parentNode;
            }
        }
        else {
            if(mode == 'save') {
                const path = node.tag.path;
                node.Dispose();
                Tools.RenameFolder(path, parentNode.tag.path + value + '/');
            }
        }
    }

    set multiple(value) {
        this._files.showCheckboxes = value === true || value === 'true';
    } 

    get multiple() {
        return this._files.showCheckboxes;
    }

    get selected() {
        return this._files.selected;
    }

    get checked() {
        return this._files.checked;
    }

    _enableFilesPane() {
        
        const selection = this._folders.selected;
        const folder = selection?.tag;

        const filesSelected = this._files.selected;
        const filesChecked = this._files.checked;
        
        this._searchInput.enabled = selection && folder !== null;
        this._files.enabled = selection && folder !== null;
        this._uploadFile.enabled = selection && folder !== null;
        this._editFile.enabled = (!!filesSelected || filesChecked.length == 1);
        this._deleteFile.enabled = (!!filesSelected || filesChecked.length > 0);

    }

    __checkChangedOnFiles(event, args) {
        this._enableFilesPane();
        this.Dispatch('SelectionChanged', {});
    }

    __filesSelectionChanged(event, args) {
        this._enableFilesPane();
        this.Dispatch('SelectionChanged', {});
    }
    
    __foldersSelectionChanged(event, args) {

        this._enableFilesPane();

        const selection = this._folders.selected;
        if(!selection) {
            return false;
        }

        const folder = selection.tag;
        if(!folder) {
            return false;
        }

        this._files.UnselectAllRows();
        this._files.UncheckAllRows();
        Tools.Files(folder.path);
        this.Dispatch('SelectionChanged', {});

    }

}