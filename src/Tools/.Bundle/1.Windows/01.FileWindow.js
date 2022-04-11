App.Modules.Tools.Windows.FileWindow = class extends Colibri.UI.Window {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.Windows.FileWindow'], 'Выбор файлов');

        this.AddClass('app-file-window-component');


        this._manager = this.Children('manager');
        this._manager.AddHandler('SelectionChanged', (event, args) => this.__selectionChangedOnManager(event, args));

        this._cancel = this.Children('cancel');
        this._save = this.Children('save');

        
    }

    __selectionChangedOnManager(event, args) {
        this._save.enabled = !!this._manager.selected || this._manager.checked.length > 0;
    }

    Show(multiple = true) {

        this._manager.multiple = multiple;
        this.shown = true;   

        App.Loading.Show();
        return new Promise((resolve, reject) => {
            App.Loading.Hide();

            // const promiseDataBinding = dataBinding && typeof dataBinding === 'string' ? App.Store.AsyncQuery(dataBinding) : new Promise((rs, rj) => rs(dataBinding));
            // const promiseFieldsBinding = fieldBinding && typeof fieldBinding === 'string' ? App.Store.AsyncQuery(fieldBinding) : new Promise((rs, rj) => rs(fieldBinding));

            // Promise.all([promiseFieldsBinding, promiseDataBinding])
            //     .then((response) => {
        
            //         const storage = response[0];
            //         const value = response[1];
        
            //         this._form.fields = this._performChanges(storage).fields;
            //         this._form.value = value;
                    
            //         App.Loading.Hide();

            //         this._save.ClearHandlers();
            //         this._save.AddHandler('Clicked', () => {
            //             resolve(this._form.value);
            //             this.Hide();
            //         });

            //         this._cancel.ClearHandlers();
            //         this._cancel.AddHandler('Clicked', () => {
            //             reject();
            //             this.Hide();
            //         });
        
            //     });
    
        });

    }

}