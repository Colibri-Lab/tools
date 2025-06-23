App.Modules.Tools.ExecutePHPPage = class extends Colibri.UI.Component 
{
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.ExecutePHPPage']);

        this.AddClass('app-execute-page-component'); 

        this._runningScriptPid = null;
        this._runningChannel = null;

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

        this._button = this.Children('top/flex/run');
        this._kill = this.Children('top/flex/kill');
        this._running = this.Children('top/flex/running');

        this._results = this.Children('bottom/split/results');
        this._results.__renderItemContent = (itemData, item) => {
            return levels[itemData.level] + ': ' + itemData.message;
        };
        this._resultsGroup = this.Children('bottom/split/results/group');

        this._form = this.Children('bottom/split/form');
        this._form.fields = {
            script: {
                type: 'longtext',
                component: 'App.Modules.Manage.UI.TinyMCETextArea',
                params: {
                    code: 'php'
                }
            }
        };

        this._button.AddHandler('Clicked', (event, args) => this.__runClicked(event, args));
        this._kill.AddHandler('Clicked', (event, args) => this.__killClicked(event, args));

        if(App.Comet) {
            this.__eventReceived = (event, args) => this.__cometEventReceived(event, args);
            App.Comet.RemoveHandler('EventReceived', this.__eventReceived);
            App.Comet.AddHandler('EventReceived', this.__eventReceived);
        } 
    }

    _disableControls() {
        this._button.enabled = false;
        this._kill.enabled = true;
        this._form.enabled = false;
        this.tab.closable = false;
        this._running.shown = true;
    }
    
    _enableControls() {
        this._button.enabled = true;
        this._kill.enabled = false;
        this._form.enabled = true;
        this.tab.closable = true;
        this._running.shown = false;
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __runClicked(event, args) {

        Tools.Call('Execute', 'Run', {script: this._form.value.script}).then((response) => {
            App.Notices.Add(new Colibri.UI.Notice('#{tools-execute-run-success}', Colibri.UI.Notice.Success));

            this._resultsGroup.Clear();
            this._runningScriptPid = response.result.pid;
            this._runningChannel = response.result.key;

            this._disableControls();

        }).catch(response => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __killClicked(event, args) {
        Tools.Call('Execute', 'Kill', {pid: this._runningScriptPid}).then((response) => {
            App.Notices.Add(new Colibri.UI.Notice('#{tools-execute-killed-success}', Colibri.UI.Notice.Success));

            this._enableControls();
            this._runningScriptPid = null;
            this._runningChannel = null;

        }).catch(response => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    __cometEventReceived(event, args) {
        if(args.event.action === this._runningChannel) {
            // наше, обрабатываем
            // это дебаг, выводим с список 
            this._resultsGroup.AddItem(args.event.message);
            if(args.event.message.message === '--complete--') {
                this._enableControls();
                this._runningScriptPid = null;
                this._runningChannel = null;
            }

        }
    }

}