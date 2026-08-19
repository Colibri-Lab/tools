/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof App.Modules.Tools.UI
 */
App.Modules.Tools.UI.BackupLog = class extends Colibri.UI.Component
{
    /**
     * @param {string} name component name
     * @param {Colibri.UI.Container} container component container
     * @constructor
     */
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

        this._close.AddHandler('Clicked', this.__closeClicked, false, this);

    }

    /**
     * Adds a message to the log
     * @param {string} message message to add
     * @public
     */
    Add(message) {
        this._group.AddItem(message);
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __closeClicked(event, args) {
        this._group.Clear();
        this.Hide();
    }

}