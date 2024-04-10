App.Modules.Tools.NoticesPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.NoticesPage']);

        this.AddClass('app-tools-notices-page-component');

        this._notices = this.Children('split/notices-pane/notices');
        this._title = this.Children('split/data-pane/ttl');
        this._form = this.Children('split/data-pane/editor-pane/editor');
        this._save = this.Children('split/data-pane/buttons-pane/save');

        this._notices.AddHandler('SelectionChanged', (event, args) => this.__noticesSelectionChanged(event, args));
        this._notices.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderNoticesContextMenu(event, args))
        this._notices.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnNoticesContextMenu(event, args));     
        this._notices.AddHandler('NodeEditCompleted', (event, args) => this.__noticesNodeEditCompleted(event, args));

        this._save.AddHandler('Clicked', (event, args) => this.__saveClicked(event, args));
        
    }


    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __noticesSelectionChanged(event, args) {

        const selection = this._notices.selected;
        if(!selection || selection.name === 'root') {
            this._form.fields = {};
            this._form.value = {};
            return false;
        }

        const notice = selection.tag;
        if(notice?.new) {
            return false;
        }

        this._title.value = notice.name + ' (' + (notice.subject ? notice.subject : '#{tools-notices-fields-nodesc}') + ')';
        this._form.fields = {
            name: {
                type: 'varchar',
                component: 'Text',
                desc: '#{tools-notices-fields-desc}',
                note: '#{tools-notices-fields-desc-note}'
            },
            subject: {
                type: 'varchar',
                component: 'Text',
                desc: '#{tools-notices-fields-subject}',
                note: '#{tools-notices-fields-subject-note}'
            },
            body: {
                type: 'varchar',
                component: 'App.Modules.Manage.UI.TinyMCETextArea',
                params: {
                    visual: true
                },
                desc: '#{tools-notices-fields-body}',
                note: '#{tools-notices-fields-body-note}'
            }
        }
        
        this._form.value = notice;

    }

    
    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __noticesNodeEditCompleted(event, args) {

        const node = args.node;
        const mode = args.mode;
        const value = args.value;
        if(node.tag?.new) {
            // добавляем
            node.Dispose();
            if(mode == 'save') {
                Tools.CreateNotice({name: value, subject: '', body: ''});
            }
            return true;
        }
        

    }

    
    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __renderNoticesContextMenu(event, args) {
        let contextmenu = [];

        const itemData = args.item?.tag;
        if(!itemData) {
            contextmenu.push({name: 'new-notice', title: '#{tools-notices-contextmenu-newnotice}', icon: Colibri.UI.ContextMenuAddIcon});
            this._notices.contextmenu = contextmenu;
            this._notices.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left top', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }
        else {
            contextmenu.push({name: 'remove-notice', title: '#{tools-notices-contextmenu-deletenotice}', icon: Colibri.UI.ContextMenuRemoveIcon});
            args.item.contextmenu = contextmenu;
            args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.LB], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clickOnNoticesContextMenu(event, args) {
        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }

        if(menuData.name == 'remove-notice') {
            const notice = item.tag;
            this._notices.selected = null;
            Tools.DeleteNotice(notice.id);
        }
        else if(item instanceof Colibri.UI.Tree) {
            const node = this._notices.AddNew('UNTITLED', {new: true, name: 'UNTITLED'});
            node.editable = true;
            node.Edit();
        }

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __saveClicked(event, args) {

        const selection = this._notices.selected;
        if(!selection || selection.name === 'root') {
            this._form.fields = {};
            this._form.value = {};
            return false;
        }

        const notice = selection.tag;
        if(notice?.new) {
            return false;
        }

        const data = this._form.value;
        notice.name = data.name;
        notice.subject = data.subject;
        notice.body = data.body;
        Tools.SaveNotice(notice);
        
    }

    

}