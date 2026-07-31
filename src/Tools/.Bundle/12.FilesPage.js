
/**
 * Files page component
 * @class
 * @extends Colibri.UI.Component
 * @memberof App.Modules.Tools
 */
App.Modules.Tools.FilesPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.FilesPage']);

        this.AddClass('app-files-page-component');

    }


}