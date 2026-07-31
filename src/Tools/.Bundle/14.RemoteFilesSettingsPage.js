/**
 * Remote files settings page component
 * @class
 * @extends Colibri.UI.Component
 * @memberof App.Modules.Tools
 */
App.Modules.Tools.RemoteFilesSettingsPage = class extends Colibri.UI.Component 
{

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Tools.RemoteFilesSettingsPage']);

        this.AddClass('app-remote-files-page-component');

    }

}