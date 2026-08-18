/**
 * Mixins grid component
 * @class
 * @extends Colibri.UI.Grid
 * @memberof App.Modules.Tools
 */
App.Modules.Tools.MixinsGrid = class extends Colibri.UI.Grid {

    /**
     * Creates an instance of MixinsGrid.
     * @param {string} name - The name of the component
     * @param {Colibri.UI.Container} container - The container to which the component belongs
     * @constructor
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-backups-grid-component');
    } 

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path
     * @ignore 
     */
    __renderBoundedValues(data, path) {

        if(!data) {
            return;
        }
        else if(Object.isObject(data)) {
            return;
        }
        
        this.ClearAllRows();
        this.rows.title = '';
        
        data.forEach((d) => {
            this.rows.Add('data' + d.name, d);
        });
    }

}