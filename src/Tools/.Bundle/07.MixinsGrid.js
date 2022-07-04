App.Modules.Tools.MixinsGrid = class extends Colibri.UI.Grid {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-backups-grid-component');
    }

    __renderBoundedValues(data) {

        if(!data) {
            return;
        }
        else if(!Array.isArray(data) && data instanceof Object) {
            return;
        }
        
        this.ClearAllRows();
        this.rows.title = '';
        
        data.forEach((d) => {
            this.rows.Add('data' + d.name, d);
        });
    }

}