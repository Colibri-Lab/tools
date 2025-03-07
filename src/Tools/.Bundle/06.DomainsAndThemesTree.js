App.Modules.Tools.DomainsAndThemesTree = class extends Colibri.UI.Tree {
    
    constructor(name, container) {
        super(name, container);

        this.RegisterEvent('NodesLoaded', false, 'Когда все узлы загружены');
    }


    __renderBoundedValues(data, binded) {
        
        if(binded.indexOf('domainkeys') !== -1) {

            this.nodes.Clear();  
            if(Object.isObject(data)) {
                data = Object.values(data);
            }

            for(const domainkey of data) {
    
                let newNode = this.FindNode('domainkey' + domainkey.value);
                if(!newNode) {
                    newNode = this.nodes.Add('domainkey' + domainkey.value);
                }
                newNode.text = domainkey.title;
                newNode.isLeaf = true;
                newNode.icon = App.Modules.Sites.Icons.FolderIconPublished;
                newNode.tag = {type: 'domain', data: domainkey};
    
            }

        }
        else if(binded.indexOf('themes') !== -1) {
            if(!data) {
                this.nodes.ForEach((name, node) => {
                    for(const n of node.nodes.Children()) {
                        n.nodes.Clear();
                    }                        
                });
            }

            if(Object.isObject(data)) {
                data = Object.values(data);
            }

            if(data.length == 0) {
                this.nodes.ForEach((name, node) => {
                    for(const n of node.nodes.Children()) {
                        n.nodes.Clear();
                    }                        
                });
            }

            for(const theme of data) {

                theme.value = theme.id;

                const domainNode = this.FindNode('domainkey' + theme.domain);
                if(!domainNode) {
                    continue;
                }
    
                let newNode = this.FindNode('theme' + theme.id);
                if(!newNode) {
                    newNode = domainNode.nodes.Add('theme' + theme.id);
                }
                newNode.text = theme.desc ? theme.desc : theme.name;
                newNode.isLeaf = true;
                newNode.icon = theme.current ? App.Modules.Tools.Icons.ThemesCurrentIcon : App.Modules.Tools.Icons.ThemesIcon;
                newNode.tag = {type: 'theme', data: theme};
    
            }

        }



        this.Dispatch('NodesLoaded');

    }

    _removeUnexistent(found, type) {
        this.allNodes.forEach((node) => {
            if(node.name.indexOf(type) === 0 && found.indexOf(type + node.tag.data.value) === -1) {
                node.Dispose();
            }
        });
    }

    AddNew(domainNode, title, tag) {

        domainNode.Expand();
        
        const node = domainNode.nodes.Add('new');
        node.text = title;
        node.isLeaf = true;
        node.icon = App.Modules.Tools.Icons.ThemesIcon;
        node.tag = tag;

        return node;
    }
    
}