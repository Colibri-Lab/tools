App.Modules.Tools.NoticesTree = class extends Colibri.UI.Tree {
    
    constructor(name, container) {
        super(name, container);

        this.RegisterEvent('NodesLoaded', false, 'Когда все узлы загружены');
    }
 

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
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

            } else {
                    
                let newNode = this.FindNode('notice' + notice.id);
                if(!newNode) {
                    newNode = this.nodes.Add('notice' + notice.id);
                }
                newNode.text = notice.name;
                newNode.isLeaf = true;
                newNode.icon = Colibri.UI.MessageEnvelopeIcon;
                newNode.tag = notice;


            }

            found.push('notice' + notice.id);



        }

        this._removeUnexistent(found);

        this.Dispatch('NodesLoaded');

    }

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

    AddNew(title, tag, parentNode = null) {

        const node = (parentNode ?? this).nodes.Add('new');
        node.text = title;
        node.isLeaf = true;
        node.icon = Colibri.UI.MessageEnvelopeIcon;
        node.tag = tag;
    
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