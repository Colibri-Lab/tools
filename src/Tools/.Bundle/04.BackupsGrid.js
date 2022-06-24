App.Modules.Tools.BackupsGrid = class extends Colibri.UI.Grid {

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

        console.log(data);

        this.ClearAllRows();
        this.rows.title = '';
        
        let found = [];
        data.forEach((d) => {
            console.log(d);
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