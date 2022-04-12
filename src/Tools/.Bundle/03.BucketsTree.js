App.Modules.Tools.BucketsTree = class extends Colibri.UI.Tree {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-buckets-tree-component');
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

        let found = [];
        data.forEach((bucket) => {

            let newNode = this.FindNode(bucket.token);
            if(!newNode) {
                newNode = this.nodes.Add(bucket.token);
            }
            newNode.text = bucket.name;
            newNode.isLeaf = true;
            newNode.icon = App.Modules.Sites.Icons.BucketIcon;
            newNode.tag = bucket;

            found.push(bucket.token);

            return true;

        });

        this._removeUnexistent(found);

    }

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