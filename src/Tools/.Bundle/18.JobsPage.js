App.Modules.Tools.JobsPage = class extends Colibri.UI.Component 
{
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.JobsPage']);

        this.AddClass('app-jobs-page-component');

        this.binding = 'app.tools.pipelines';

        this._splitVrTopActivePipelines = this.Children('split-vr/top/active-pipelines');
        this._splitVrBottomSplitHrLeftSuccessedPipelines = this.Children('split-vr/bottom/split-hr/left/successed-pipelines');
        this._splitVrBottomSplitHrRightErrorPipelines = this.Children('split-vr/bottom/split-hr/right/error-pipelines');
        
        this._splitVrTopActivePipelines.rows.title = '';
        this._splitVrBottomSplitHrLeftSuccessedPipelines.rows.title = '';
        this._splitVrBottomSplitHrRightErrorPipelines.rows.title = '';

        // Tools.AddHandler('PipelinesChanged', (event, args) => this.__pipelinesChanged(event, args));
        this.AddHandler('Shown', (event, args) => this.__thisShown(event, args));
        this.AddHandler('Hidden', (event, args) => this.__thisHidden(event, args));

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisShown(event, args) {
        Tools.Store.Reload('tools.pipelines', false);
        Colibri.Common.StartTimer('pipelines', 5000, () => {
            Tools.Store.Reload('tools.pipelines', false);
        });
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisHidden(event, args) {
        Colibri.Common.StopTimer('pipelines');
    }

    
    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {
        if(!data) {
            return;
        }
        this.value = data;
    }

    /**
     * Value Object
     * @type {Object}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Object
     * @type {Object}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
        this._splitVrTopActivePipelines.rows.Update(this._value.active);
        
        this._splitVrBottomSplitHrLeftSuccessedPipelines.rows.Update(this._value.success);
        this._splitVrBottomSplitHrLeftSuccessedPipelines.rows.SortById((a, b) => a < b ? 1 : -1);
        
        this._splitVrBottomSplitHrRightErrorPipelines.rows.Update(this._value.errors);
        this._splitVrBottomSplitHrRightErrorPipelines.rows.SortById((a, b) => a < b ? 1 : -1);

    }

}
