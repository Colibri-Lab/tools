App.Modules.Tools.BackupPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.BackupPage']);

        this.AddClass('app-backup-page-component'); 

        this._create = this.Children('top/create');
        this._backups = this.Children('bottom/backups');

        this._create.AddHandler('Clicked', (event, args) => this.__createButtonClicked(event, args));
        this._backups.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderDataContextMenu(event, args));
        this._backups.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnDataContextMenu(event, args));  
    }

    _showCreateEditWindow(data = null) {

        const title = data ? '#{tools-backups-windowtitle-editbackup;Редактировать задание}' : '#{tools-backups-windowtitle-newbackup;Новое задание}';

        Manage.FormWindow.Show(title, 1024, 'app.manage.storages(backups)', data ? data : {})
            .then((dta) => {
                Tools.SaveBackup(dta);
            })
            .catch(() => {});

    }

    __createButtonClicked(event, args) {
        this._showCreateEditWindow();
    }

    __renderDataContextMenu(event, args) {
        let contextmenu = [];
        
        contextmenu.push({name: 'edit-backup', title: '#{tools-backups-contextmenu-edit;Редактировать}', icon: Colibri.UI.ContextMenuEditIcon});
        contextmenu.push({name: 'remove-backup', title: '#{tools-backups-contextmenu-delete;Удалить}', icon: Colibri.UI.ContextMenuRemoveIcon});

        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.LB], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        
    }

    __clickOnDataContextMenu(event, args) {
        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }

        if(menuData.name == 'edit-backup') {
            this._showCreateEditWindow(item.value);
        }
        else if(menuData.name == 'remove-backup') {
            this._deleteData.Dispatch('Clicked');
        }
    }

} 