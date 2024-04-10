App.Modules.Tools.BackupsGrid = class extends Colibri.UI.Grid {

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
        
        let found = [];
        data.forEach((d) => {
            found.push('data' + d.id);
            let row = this.FindRow('data' + d.id);
            if(!row) {
                this.rows.Add('data' + d.id, d);
            }
            else {
                row.value = d;
            }
        });
    }

}