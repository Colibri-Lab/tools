/**
 * Settings tree component
 * @class
 * @extends Colibri.UI.Tree
 * @memberof App.Modules.Tools
 */
App.Modules.Tools.SettingsTree = class extends Colibri.UI.Tree {
    
    /**
     * Creates an instance of SettingsTree.
     * @param {string} name - The name of the component
     * @param {Colibri.UI.Container} container - The container to which the component belongs
     * @constructor
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-settings-tree-component');

        this.hasSearchBox = true;
        this.searchFilterCallback = (node, term) => {
            return node.text.toLowerCase().indexOf(term.toLowerCase()) !== -1;
        };
        
    }
 

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     * @ignore
     */
    __renderBoundedValues(data, path) {
        if(!data) {
            this.nodes.Clear();
            return;
        }

        if(Object.isObject(data)) {
            data = Object.values(data);
        }

        if(data.length == 0) {
            this.nodes.Clear();
        }

        let rootNode = this.FindNode('root');
        if(!rootNode) {
            rootNode = this.nodes.Add('root');
        }
        rootNode.text = '#{tools-settings-tree-root}';
        rootNode.isLeaf = false;
        rootNode.icon = App.Modules.Tools.Icons.SettingsRootIcon;
        rootNode.AddClass('app-modules-tools-settingstree-root-node');
        rootNode.tag = null;
        rootNode.Expand();

        Manage.Store.AsyncQuery('manage.storages(name=settings,module=tools)').then((settings) => {

            let found = [];
            data.forEach((setting) => {
    
                let newNode = this.FindNode(setting.name);
                if(!newNode) {
                    newNode = rootNode.nodes.Add(setting.name);
                }
                newNode.text = setting.name;
                newNode.isLeaf = true;

                // const type = Array.find(settings.fields.type.values, 'value', setting.type.value);
                // const icon = eval(type.icon);

                newNode.icon = Tools.TypeIcon(setting.type.value);
                newNode.tag = setting;
                newNode.editable = true;
                newNode.AddClass('app-modules-tools-settingstree-setting-node');

                found.push(setting.name);
    
                return true;
    
            });

            this._removeUnexistent(found);


        });

    }

    /**
     * Removes nodes that do not exist in the provided list of found node names
     * @private
     * @param {Array<string>} found - The list of found node names
     * @ignore
     */
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

    /**
     * Adds a new node to the settings tree
     * @param {string} title - The title of the new node
     * @param {object} type - The type object containing icon information
     * @param {object} tag - The tag data to associate with the new node
     * @returns {Colibri.UI.TreeNode} - The newly added tree node
     * @public
     */
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