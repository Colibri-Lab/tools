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

        this._button = this.Children('top/run');
        this._progress = this.Children('top/progress');

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

        App.Comet.AddHandler('EventReceived', (event, args) => this._cometEventReceived(event, args));

    }

    _disableControls() {
        this._button.enabled = false;
        this._form.enabled = false;
    }
    
    _enableControls() {
        this._button.enabled = true;
        this._form.enabled = true;
    }

    __runClicked(event, args) {

        Tools.Call('Execute', 'Run', {script: this._form.value.script}).then((response) => {
            App.Notices.Add(new Colibri.UI.Notice('#{tools-execute-run-success;Скрипт запущен успешно}', Colibri.UI.Notice.Success));

            this._resultsGroup.Clear();
            this._runningScriptPid = response.result.pid;
            this._runningChannel = response.result.key;
            this._progress.Start(300, 1.2);

            this._disableControls();

        }).catch(response => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });

    }

    _cometEventReceived(event, args) {
        if(args.event.action === this._runningChannel) {
            // наше, обрабатываем
            // это дебаг, выводим с список 
            this._resultsGroup.AddItem(args.event.message);
            if(args.event.message.message === '--complete--') {
                this._enableControls();
                this._runningScriptPid = null;
                this._runningChannel = null;
                this._progress.Stop();
            }

        }
    }

}