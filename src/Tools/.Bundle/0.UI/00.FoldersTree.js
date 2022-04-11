App.Modules.Tools.UI.FoldersTree = class extends Colibri.UI.Tree {
    
    constructor(name, container) {
        super(name, container);
        this._foldersList = [];
    }

    _findLevel(parent) {
        let ret = [];
        this._foldersList.forEach((folder) => {
            if(folder?.parent == parent) {
                folder.isLeaf = this._findLevel(folder.path).length === 0;
                ret.push(folder);
            }
        });
        return ret;
    }

    _renderLevel(node, parent) {

        const folders = this._findLevel(parent);
        folders.forEach((folder) => {
            let newNode = this.FindNode(folder.path.replaceAll('/', '_'));
            if(!newNode) {
                newNode = node.nodes.Add(folder.path.replaceAll('/', '_'));
            }
            newNode.text = folder.name;
            newNode.isLeaf = folder.isLeaf;
            newNode.icon = App.Modules.Tools.Icons.FolderIcon;
            newNode.tag = folder;
            newNode.editable = true;
            

            if(!folder.parent) {
                newNode.parentNode = this.FindNode('root');
            }
            else if(folder.parent.path != newNode.parentNode?.tag?.path) {
                const parentNode = this.FindNode(folder.parent.replaceAll('/', '_'));
                newNode.parentNode = parentNode;
                parentNode.Expand();
            }

            this._renderLevel(newNode, folder.path);

        });

    }

    _removeUnexistent() {
        this.allNodes.forEach((node) => {
            if(node.tag?.path === '') {
                return true;
            }
            if(this._foldersList.indexOf(node.tag) === -1) {
                node.Dispose();
            }
        });
    }

    __renderBoundedValues(data) {

        if(!Array.isArray(data) && data instanceof Object) {
            data = Object.values(data);
        }

        this._foldersList = data;

        let newNode = this.FindNode('root');
        if(!newNode) {
            newNode = this.nodes.Add('root');
        }
        newNode.text = 'Ресурсы';
        newNode.isLeaf = false;
        newNode.icon = App.Modules.Tools.Icons.FolderIcon;
        newNode.tag = {path: '', name: ''};

        this._renderLevel(newNode, '');
        newNode.Expand();

        this._removeUnexistent();

    }

    
    AddNew(parent, title, tag) {
        const node = parent.nodes.Add('new');
        node.text = title;
        node.isLeaf = true;
        node.icon = App.Modules.Tools.Icons.FolderIcon;
        node.tag = tag;
        return node;
    }
    
}