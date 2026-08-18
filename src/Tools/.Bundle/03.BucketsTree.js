/**
 * Buckets tree component
 * @class
 * @extends Colibri.UI.Tree
 * @memberof App.Modules.Tools
 */
App.Modules.Tools.BucketsTree = class extends Colibri.UI.Tree {
    
    /**
     * Creates an instance of BucketsTree.
     * @param {string} name - The name of the component
     * @param {Colibri.UI.Container} container - The container to which the component belongs
     * @constructor
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-buckets-tree-component');
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
        data.forEach((bucket) => {

            let newNode = this.FindNode(bucket.token);
            if(!newNode) {
                newNode = this.nodes.Add(bucket.token);
            }
            newNode.text = bucket.name;
            newNode.isLeaf = true;
            newNode.icon = App.Modules.Tools.Icons.BucketIcon;
            newNode.tag = bucket;
            newNode.AddClass('app-modules-tools-bucketstree-bucket-node');

            found.push(bucket.token);

            return true;

        });

        this._removeUnexistent(found);

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
            if(found.indexOf(node.tag.token) === -1) {
                node.Dispose();
            }
        });
    }

    /**
     * Adds a new node to the buckets tree  
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