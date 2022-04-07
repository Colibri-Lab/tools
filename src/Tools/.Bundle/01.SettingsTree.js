App.Modules.Tools.SettingsTree = class extends Colibri.UI.Tree {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-settings-tree-component');
    }


    __renderBoundedValues(data) {
        if(!data) {
            this.nodes.Clear();
            return;
        }

        if(!Array.isArray(data) && data instanceof Object) {
            data = Object.values(data);
        }

        if(data.length == 0) {
            this.nodes.Clear();
        }

        let rootNode = this.FindNode('root');
        if(!rootNode) {
            rootNode = this.nodes.Add('root');
        }
        rootNode.text = 'Настройки сайта';
        rootNode.isLeaf = false;
        rootNode.icon = App.Modules.Tools.Icons.SettingsRootIcon;
        rootNode.tag = null;
        rootNode.Expand();

        Manage.Store.AsyncQuery('manage.storages(settings)').then((settings) => {

            let found = [];
            data.forEach((setting) => {
    
                let newNode = this.FindNode(setting.name);
                if(!newNode) {
                    newNode = rootNode.nodes.Add(setting.name);
                }
                newNode.text = setting.name;
                newNode.isLeaf = true;

                const type = Array.find(settings.fields.type.values, 'value', setting.type.value);
                const icon = eval(type.icon);

                newNode.icon = icon;
                newNode.tag = setting;
                newNode.editable = true;

                found.push(setting.name);
    
                return true;
    
            });

            this._removeUnexistent(found);


        });

    }

    _removeUnexistent(found) {
        this.allNodes.forEach((node) => {
            if(node.tag === null) {
                return true;
            }
            if(found.indexOf(node.tag.name) === -1) {
                node.Dispose();
            }
        });
    }

    AddNew(title, type, tag) {
        const rootNode = this.FindNode('root');
        const node = rootNode.nodes.Add('new');
        node.text = title;
        node.isLeaf = true;
        node.icon = eval(type.icon);
        node.tag = tag;
        return node;
    }
    
}