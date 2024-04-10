App.Modules.Tools.MixinsGrid = class extends Colibri.UI.Grid {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-backups-grid-component');
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