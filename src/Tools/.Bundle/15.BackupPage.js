App.Modules.Tools.BackupPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.BackupPage']);

        this.AddClass('app-backup-page-component'); 

        this._create = this.Children('top/create');
        this._backups = this.Children('bottom/backups');

        this._create.AddHandler('Clicked', this.__createButtonClicked, false, this);
        this._backups.AddHandler('DoubleClicked', this.__doubleClickedOnData, false, this);
        this._backups.AddHandler('ContextMenuIconClicked', this.__renderDataContextMenu, false, this);
        this._backups.AddHandler('ContextMenuItemClicked', this.__clickOnDataContextMenu, false, this);  
    }

    _showCreateEditWindow(data = null) {

        const title = data ? '#{tools-backups-windowtitle-editbackup}' : '#{tools-backups-windowtitle-newbackup}';

        Manage.FormWindow.Show(title, 1024, 'app.manage.storages(backups)', data ? data : {})
            .then((dta) => {
                Tools.SaveBackup(dta);
            })
            .catch(() => {});

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __createButtonClicked(event, args) {
        this._showCreateEditWindow();
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __renderDataContextMenu(event, args) {
        let contextmenu = [];
        
        contextmenu.push({name: 'edit-backup', title: '#{tools-backups-contextmenu-edit}', icon: Colibri.UI.ContextMenuEditIcon});
        contextmenu.push({name: 'remove-backup', title: '#{tools-backups-contextmenu-delete}', icon: Colibri.UI.ContextMenuRemoveIcon});

        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
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
            App.Confirm.Show('#{tools-backups-deletedata1}', '#{tools-backups-deletedata1message}', '#{tools-backups-deletedata1message-delete}').then(() => {
                Tools.DeleteBackup(item.value.id);
            });
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __doubleClickedOnData(event, args) {
        const data = this._backups.selected?.value;
        this._showCreateEditWindow(data);
    }

} 