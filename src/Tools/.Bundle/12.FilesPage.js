
/**
 * Files page component
 * @class
 * @extends Colibri.UI.Component
 * @memberof App.Modules.Tools
 */
App.Modules.Tools.FilesPage = class extends Colibri.UI.Component 
{

    /**
     * Creates an instance of FilesPage.
     * @param {string} name - The name of the component
     * @param {Colibri.UI.Container} container - The container to which the component belongs
     * @constructor
     */
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.FilesPage']);

        this.AddClass('app-files-page-component');

    }


}