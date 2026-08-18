/**
 * Notices tree component
 * @class
 * @extends Colibri.UI.Tree
 * @memberof App.Modules.Tools
 */
App.Modules.Tools.NoticesTree = class extends Colibri.UI.Tree {
    
    /**
     * Creates an instance of NoticesTree.
     * @param {string} name - The name of the component
     * @param {Colibri.UI.Container} container - The container to which the component belongs
     * @constructor
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-notices-tree-component');
        this.expandOnClick = true;
        this.hasSearchBox = true;
        this.searchFilterCallback = (node, term) => {
            return node.text.toLowerCase().indexOf(term.toLowerCase()) !== -1;
        };
        this.searchBoxPlaceholder = '#{tools-notices-search-placeholder}';
        this.RegisterEvent('NodesLoaded', false, 'Когда все узлы загружены');
    }
 

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     * @private
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
        let found = [];
        for(const notice of data) {

            const parts = notice.name.split('_');
            if(parts.length > 1) {
                let parentNode = this;
                let path = [];
                for(let i=0; i<parts.length - 1; i++) {

                    const part = parts[i];
                    path.push(part);
                    if(this.FindByPath(path.join('/'))) {
                        parentNode = this.FindByPath(path.join('/'));
                    } else {
                        parentNode = parentNode.nodes.Add(part);
                        parentNode.text = part;
                        parentNode.icon = App.Modules.Tools.Icons.FolderIcon;
                        parentNode.AddClass('app-notices-tree-folder-node');
                        parentNode.tag = null;
                    }
                    found.push(part);
                    
                }

                let newNode = this.FindNode('notice' + notice.id);
                if(!newNode) {
                    newNode = parentNode.nodes.Add('notice' + notice.id);
                }
                newNode.text = notice.name;
                newNode.isLeaf = true;
                newNode.icon = Colibri.UI.MessageEnvelopeIcon;
                newNode.tag = notice;
                newNode.AddClass('app-notices-tree-notice-node');

            } else {
                    
                let newNode = this.FindNode('notice' + notice.id);
                if(!newNode) {
                    newNode = this.nodes.Add('notice' + notice.id);
                }
                newNode.text = notice.name;
                newNode.isLeaf = true;
                newNode.icon = Colibri.UI.MessageEnvelopeIcon;
                newNode.tag = notice;
                newNode.AddClass('app-notices-tree-notice-node');

            }

            found.push('notice' + notice.id);



        }

        this._removeUnexistent(found);

        this.Dispatch('NodesLoaded');

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
            if(found.indexOf('notice' + node.tag.id) === -1 && found.indexOf(node.name) === -1) {
                node.Dispose();
            }
        });
    }

    /**
     * Adds a new node to the notices tree
     * @param {string} title - The title of the new node
     * @param {object} tag - The tag data to associate with the new node
     * @param {Colibri.UI.TreeNode} [parentNode=null] - The parent node to which the new node will be added (optional)
     * @returns {Colibri.UI.TreeNode} - The newly added tree node
     * @public
     */
    AddNew(title, tag, parentNode = null) {

        const node = (parentNode ?? this).nodes.Add('new');
        node.text = title;
        node.isLeaf = true;
        node.icon = Colibri.UI.MessageEnvelopeIcon;
        node.tag = tag;
        node.AddClass('app-notices-tree-notice-node');
    
        return node;

    }

    GetPath(node, splitter = '/') {
        let path = [];
        let parentNode = node;
        while(parentNode instanceof Colibri.UI.TreeNode) {
            path.push(parentNode.name);
            parentNode = parentNode.parentNode;
        }
        return path.reverse().join(splitter);
    }
    
}