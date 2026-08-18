/**
 * Remote files settings page component
 * @class
 * @extends Colibri.UI.Component
 * @memberof App.Modules.Tools
 */
App.Modules.Tools.RemoteFilesSettingsPage = class extends Colibri.UI.Component 
{
    /**
     * Creates an instance of RemoteFilesSettingsPage.
     * @param {string} name - The name of the component
     * @param {Colibri.UI.Container} container - The container to which the component belongs
     * @constructor
     */
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.RemoteFilesSettingsPage']);

        this.AddClass('app-remote-files-page-component');

    }

}