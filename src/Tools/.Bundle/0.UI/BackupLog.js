App.Modules.Tools.UI.BackupLog = class extends Colibri.UI.Component
{
    constructor(name, container) {
        super(name, container);

        this.AddClass('app-tools-backup-log-component');

        this._close = new Colibri.UI.Icon(this.name + '-close', this);
        this._close.shown = true;
        this._close.value = Colibri.UI.CloseIcon;
        
        const levels = [
            'Emergency',
            'Alert',
            'Critical',
            'Error',
            'Warning',
            'Notice',
            'Informational',
            'Debug'
        ];

        this._list = new Colibri.UI.List(this.name + '-list', this);
        this._group = this._list.AddGroup('group');
        this._list.__renderItemContent = (itemData, item) => {
            return levels[itemData.level] + ': ' + itemData.message;
        };
        this._list.shown = true;

        this._close.AddHandler('Clicked', (event, args) => this.__closeClicked(event, args));

    }

    Add(message) {
        this._group.AddItem(message);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __closeClicked(event, args) {
        this._group.Clear();
        this.Hide();
    }

}