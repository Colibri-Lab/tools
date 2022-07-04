App.Modules.Tools.VarsGrid = class extends Colibri.UI.Grid {

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
        
        let found = [];
        data.forEach((d) => {
            found.push('data' + d.id);
            let row = this.FindRow('data' + d.name);
            if(!row) {
                row = this.rows.Add('data' + d.name, d);
            }
            else {
                row.value = d;
            }

            let viewer = null;
            if(d.type === 'color') {
                viewer = Colibri.UI.ColorViewer;
            }
            else if(d.type === 'border') {
                viewer = Colibri.UI.BorderViewer;
            }
            else if(d.type === 'font-family') {
                viewer = Colibri.UI.FontFamilyViewer;
            }
            else if(d.type === 'size') {
                viewer = null;
            }
            else if(d.type === 'image') {
                viewer = Colibri.UI.ImageViewer;
            }
            else if(d.type === 'shadow') {
                viewer = Colibri.UI.ShadowViewer;
            }

            row.Cell('value').viewer = viewer;
            row.value = d;

        });
    }

}