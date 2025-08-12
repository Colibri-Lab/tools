App.Modules.Tools.NoticesPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.NoticesPage']);

        this.AddClass('app-tools-notices-page-component');

        this._notices = this.Children('split/notices-pane/notices');
        this._title = this.Children('split/data-pane/ttl');
        this._form = this.Children('split/data-pane/editor-pane/editor');
        this._save = this.Children('split/data-pane/buttons-pane/save');

        this._notices.AddHandler('SelectionChanged', this.__noticesSelectionChanged, false, this);
        this._notices.AddHandler('ContextMenuIconClicked', this.__renderNoticesContextMenu, false, this)
        this._notices.AddHandler('ContextMenuItemClicked', this.__clickOnNoticesContextMenu, false, this);     
        this._notices.AddHandler('NodeEditCompleted', this.__noticesNodeEditCompleted, false, this);

        this._save.AddHandler('Clicked', this.__saveClicked, false, this);
        
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
        debugger;
        if(node.tag?.new) {
            // добавляем
            node.Dispose();
            if(mode == 'save') {
                Tools.CreateNotice({name: value, subject: node.tag.subject ?? '', body: node.tag.body ?? ''});
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
            this._notices.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RT, Colibri.UI.ContextMenu.LT], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }
        else {
            contextmenu.push({name: 'dublicate-notice', title: '#{tools-notices-contextmenu-dublicatenotice}', icon: Colibri.UI.ContextMenuRemoveIcon});
            contextmenu.push({name: 'remove-notice', title: '#{tools-notices-contextmenu-deletenotice}', icon: Colibri.UI.ContextMenuRemoveIcon});
            args.item.contextmenu = contextmenu;
            args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
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
        else if(menuData.name === 'dublicate-notice') {
            const notice = Object.cloneRecursive(item.tag);
            const node = this._notices.AddNew('UNTITLED', Object.assign(notice, {new: true, name: 'UNTITLED'}));
            node.editable = true;
            node.Edit();

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