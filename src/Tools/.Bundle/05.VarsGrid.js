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
        
        this.rows.title = '';
        
        let found = [];
        data.forEach((d) => {
            found.push('data' + d.name);
            let row = this.FindRow('data' + d.name);
            if(!row) {
                row = this.rows.Add('data' + d.name, {});
            }

            let viewer = null;
            if((d.type.value || d.type) === 'color') {
                viewer = Colibri.UI.ColorViewer;
            }
            else if((d.type.value || d.type) === 'border') {
                viewer = Colibri.UI.BorderViewer;
            }
            else if((d.type.value || d.type) === 'font-family') {
                viewer = Colibri.UI.FontFamilyViewer;
            }
            else if((d.type.value || d.type) === 'size') {
                viewer = null;
            }
            else if((d.type.value || d.type) === 'image') {
                viewer = Colibri.UI.ImageViewer;
            }
            else if((d.type.value || d.type) === 'shadow') {
                viewer = Colibri.UI.ShadowViewer;
            }

            row.Cell('value').viewer = viewer;
            row.value = d;

        });

        this.ForEveryRow((name, row) => {
            if(found.indexOf(name) === -1) {
                row.Dispose();
            }
        })

    }

}