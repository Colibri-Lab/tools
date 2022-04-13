App.Modules.Tools.NoticesTree = class extends Colibri.UI.Tree {
    
    constructor(name, container) {
        super(name, container);

        this.RegisterEvent('NodesLoaded', false, 'Когда все узлы загружены');
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
        for(const notice of data) {

            let newNode = this.FindNode('notice' + notice.id);
            if(!newNode) {
                newNode = this.nodes.Add('notice' + notice.id);
            }
            newNode.text = notice.name;
            newNode.isLeaf = true;
            newNode.icon = Colibri.UI.MessageEnvelopeIcon;
            newNode.tag = notice;

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
            if(found.indexOf('notice' + node.tag.id) === -1) {
                node.Dispose();
            }
        });
    }

    AddNew(title, tag) {
        const node = this.nodes.Add('new');
        node.text = title;
        node.isLeaf = true;
        node.icon = Colibri.UI.MessageEnvelopeIcon;
        node.tag = tag;
        return node;
    }
    
}