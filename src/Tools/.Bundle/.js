

App.Modules.Tools = class extends Colibri.Modules.Module {

    /** @constructor */
    constructor() {
        super('Tools');
    }

    

    InitializeModule() {
        super.InitializeModule();

        this._pages = {};
        

        this._store = App.Store.AddChild('app.tools', {}, this);
        this._store.AddPathLoader('tools.settings', () => this.Settings(true));
        this._store.AddPathLoader('tools.notices', () => this.Notices(true));
        this._store.AddPathLoader('tools.backups', () => this.Backups(true));
        this._store.AddPathLoader('tools.themes', () => this.Themes(true));
        this._store.AddPathLoader('tools.pipelines', () => this.Pipelines(true));

        console.log('Initializing module Tools');

        this.__appReadyHandler = (event, args) => {
            this.Render(document.body);
            if(App.Comet) {
                this.__eventReceived = (event, args) => this.__cometEventReceived(event, args);
                App.Comet.RemoveHandler('EventReceived', this.__eventReceived);
                App.Comet.AddHandler('EventReceived', this.__eventReceived);
            } 
        };
        App.RemoveHandler('ApplicationReady', this.__appReadyHandler);
        App.AddHandler('ApplicationReady', this.__appReadyHandler);

        this.AddHandler('CallProgress', (event, args) => {
            if(args.request === 'UploadFiles') {
                if(args.event.type === 'loadstart') {
                    App.Loader.opacity = 0.8;
                    App.Loader.icon = false;
                    App.Loader.progress = 0;
                    App.Loader.Show();
                }
                else if(args.event.type === 'progress') {
                    App.Loader.progress = args.event.loaded * 100 / args.event.total;
                }
                else if(args.event.type === 'loadend') {
                    App.Loader.Hide();
                    App.Loader.progress = 100;
                    App.Loader.icon = true;
                    App.Loader.opacity = 1;
                }    
            }
        });
        this._store.AddHandler('StoreLoaderCrushed', (event, args) => {
            if(args.status === 403) {
                location.reload();
            }
        });
        this.AddHandler('CallError', (event, args) => {
            if(args.status === 403) {
                location.reload();
            }
        });


    }

    Render(container) {
        console.log('Rendering Module Tools');
        

    }

    RegisterEvents() {
        console.log('Registering module events for Tools');
        this.RegisterEvent('PipelinesChanged', false, 'When pipelines changed');

    }

    RegisterEventHandlers() {
        console.log('Registering event handlers for Tools');


    }
    
    get Store() {
        return this._store;
    }

    Pipelines(returnPromise = false) {
        this.Requests('Tools.Pipelines')?.Abort()
        const promise = this.Call('Jobs', 'Dashboard', {}, {}, true, 'Tools.Pipelines');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.pipelines', response.result);
        }).catch((response) => {
            if(response.status > 0) {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            }
        });
    }

    Settings(returnPromise = false) {
        this.Requests('Settings.List')?.Abort()
        const promise = this.Call('Settings', 'List', {}, {}, true, 'Settings.List');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.settings', response.result);
        }).catch((response) => {
            if(response.status > 0) {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            }
        });
    }

    
    DeleteSetting(settingId) {
        return new Promise((resolve, reject) => {
            this.Call('Settings', 'Delete', {setting: settingId})
                .then((response) => {
                    let settings = this._store.Query('tools.settings');
                    if(!settings || !Array.isArray(settings)) {
                        settings = [];
                    }
                    let newSettings = [];
                    settings.forEach((s) => {
                        if(s.id !== settingId) {
                            newSettings.push(s);
                        }
                    });
                    this._store.Set('tools.settings', newSettings);
                    resolve(response.result);
                })
                .catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response);
                });
        });
    }

    SaveSetting(setting) {
        return new Promise((resolve, reject) => {
            this.Call('Settings', 'Save', setting)
                .then((response) => {
                    let settings = this._store.Query('tools.settings');
                    if(!settings || !Array.isArray(settings)) {
                        settings = [];
                    }
                    if(setting?.id) {
                        settings = settings.map((s) => s.id == response.result.id ? response.result : s);
                    }
                    else {
                        settings.push(response.result);
                    }
                    this._store.Set('tools.settings', settings);
                    resolve(response.result);
                })
                .catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response);
                });
        });
    }

    
    Notices(returnPromise = false) {
        this.Requests('Notices.List')?.Abort()
        const promise = this.Call('Notices', 'List', {}, {}, true, 'Notices.List');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.notices', response.result);
        }).catch((response) => {
            if(response.status > 0) {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            }
        });
    }

    CreateNotice(notice) {
        return new Promise((resolve, reject) => {
            this.Call('Notices', 'Create', notice)
                .then((response) => {
                    this._store.Set('tools.notices', response.result);
                    resolve(response.result);
                }).catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response);
                });
        });
    }

    
    DeleteNotice(noticeId) {
        return new Promise((resolve, reject) => {
            this.Call('Notices', 'Delete', {notice: noticeId})
                .then((response) => {
                    let notices = this._store.Query('tools.notices');
                    if(!notices || !Array.isArray(notices)) {
                        notices = [];
                    }
                    let newNotices = [];
                    notices.forEach((s) => {
                        if(s.id !== noticeId) {
                            newNotices.push(s);
                        }
                    });
                    this._store.Set('tools.notices', newNotices);
                    resolve(response.result);
                })
                .catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    SaveNotice(notice) {
        return new Promise((resolve, reject) => {
            this.Call('Notices', 'Save', notice)
                .then((response) => {
                    let notices = this._store.Query('tools.notices');
                    if(!notices || !Array.isArray(notices)) {
                        notices = [];
                    }
                    if(notice?.id) {
                        notices = notices.map((s) => s.id == response.result.id ? response.result : s);
                    }
                    else {
                        notices.push(response.result);
                    }
                    this._store.Set('tools.notices', notices);
                    resolve(response.result);
                })
                .catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }
    
    Backups(returnPromise = false) {
        this.Requests('Backup.List')?.Abort()
        const promise = this.Call('Backup', 'List', {}, {}, true, 'Backup.List');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.backups', response.result);
        }).catch((response) => {
            if(response.status > 0) {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            }
        });
    }

    SaveBackup(backupData) {
        return new Promise((resolve, reject) => {
            this.Call('Backup', 'Save', backupData)
                .then((response) => {
                    let backups = this._store.Query('tools.backups');
                    if(!backups || !Array.isArray(backups)) {
                        backups = [];
                    }
                    if(backupData?.id) {
                        backups = backups.map((s) => s.id == response.result.id ? response.result : s);
                    }
                    else {
                        backups.push(response.result);
                    }
                    this._store.Set('tools.backups', backups);
                    resolve(response.result);
                })
                .catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    DeleteBackup(backupId) {
        return new Promise((resolve, reject) => {
            this.Call('Backup', 'Delete', {backup: backupId})
                .then((response) => {
                    let backups = this._store.Query('tools.backups');
                    if(!backups || !Array.isArray(backups)) {
                        backups = [];
                    }
                    let newBackups = [];
                    backups.forEach((s) => {
                        if(s.id !== backupId) {
                            newBackups.push(s);
                        }
                    });
                    this._store.Set('tools.backups', newBackups);
                    resolve(response.result);
                })
                .catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    Themes(returnPromise = false) {
        this.Requests('Themes.List')?.Abort()
        const promise = this.Call('Themes', 'List', {}, {}, true, 'Themes.List');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.themes', response.result);
        }).catch((response) => {
            if(response.status > 0) {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            }
        });
    }

    CreateTheme(theme) {
        return new Promise((resolve, reject) => {
            this.Call('Themes', 'Save', theme)
                .then((response) => {
                    let themes = this._store.Query('tools.themes');
                    if(theme.id) {
                        themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                    }
                else {
                    themes.push(response.result);
                }
                this._store.Set('tools.themes', themes);
                resolve(response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
                reject(response.result);
            });
        });
    }

    ImportTheme(theme) {
        return new Promise((resolve, reject) => {
            this.Call('Themes', 'Import', theme)
                .then((response) => {
                    let themes = this._store.Query('tools.themes');
                    themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                    this._store.Set('tools.themes', themes);
                    resolve(response.result);
                }).catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }
    
    DeleteTheme(themeId) {
        return new Promise((resolve, reject) => {
            this.Call('Themes', 'Delete', {theme: themeId})
                .then((response) => {
                    let themes = this._store.Query('tools.themes');
                    let newThemes = [];
                    themes.forEach((t) => {
                        if(t.id != themeId) {
                            newThemes.push(t);
                        }
                    })
                    this._store.Set('tools.themes', newThemes);
                    resolve(response.result);
                }).catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    SetThemeAsCurrent(themeId) {
        return new Promise((resolve, reject) => {
            this.Call('Themes', 'SetAsCurrent', {id: themeId})
                .then((response) => {
                    Tools.Themes(false);
                    resolve(response.result);
                }).catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    SaveThemeVar(themeId, varData) {
        return new Promise((resolve, reject) => {
            this.Call('Themes', 'SaveVar', {id: themeId, var: varData})
                .then((response) => {
                    let themes = this._store.Query('tools.themes');
                    themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                    this._store.Set('tools.themes', themes);
                    resolve(response.result);
                }).catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    DeleteThemeVars(themeId, varNames) {
        return new Promise((resolve, reject) => {
            this.Call('Themes', 'DeleteVars', {id: themeId, vars: varNames})
                .then((response) => {
                    let themes = this._store.Query('tools.themes');
                    themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                    this._store.Set('tools.themes', themes);
                    resolve(response.result);
                }).catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    SaveThemeMixin(themeId, mixinData) {
        return new Promise((resolve, reject) => {
            this.Call('Themes', 'SaveMixin', {id: themeId, mixin: mixinData})
                .then((response) => {
                    let themes = this._store.Query('tools.themes');
                    themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                    this._store.Set('tools.themes', themes);
                    resolve(response.result);
                }).catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    DeleteThemeMixins(themeId, mixinNames) {
        return new Promise((resolve, reject) => {
            this.Call('Themes', 'DeleteMixins', {id: themeId, mixins: mixinNames})
                .then((response) => {
                    let themes = this._store.Query('tools.themes');
                    themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                    this._store.Set('tools.themes', themes);
                    resolve(response.result);
                }).catch((response) => {
                    App.Notices.Add(new Colibri.UI.Notice(response.result));
                    reject(response.result);
                });
        });
    }

    
    __cometEventReceived(event, args) {
        if(args.event.action.substring(0, 7) == 'backup-') {
            if(!this._backuplog) {
                this._backuplog = new App.Modules.Tools.UI.BackupLog('backuplog', document.body);
            }
            this._backuplog.shown = true;
            this._backuplog.Add(args.event.message);
            if(args.event.message.message === '--complete--') {
                const id = parseInt(args.event.action.replaceAll('backup-', ''));
                this._store.AsyncQuery('tools.backups').then((backups) => {
                    backups.forEach(b => {
                        if(b.id == id) {
                            b.running = false;
                        }
                    });
                    this._store.Set('tools.backups', backups);
                });
            }
        } else if(args.event.action == 'pipeline') {
            this.Dispatch('PipelinesChanged', args.event);
        }
    }

    TypeIcon(type) {
        return {
            double:  App.Modules.Tools.Icons.ContextMenuDoubleIcon,
            text: App.Modules.Tools.Icons.ContextMenuTextIcon,
            textarea: App.Modules.Tools.Icons.ContextMenuTextAreaIcon,
            html: App.Modules.Tools.Icons.ContextMenuHtmlIcon,
            htmlcode: App.Modules.Tools.Icons.ContextMenuHtmlCodeIcon,
            date: App.Modules.Tools.Icons.ContextMenuDateIcon,
            datetime: App.Modules.Tools.Icons.ContextMenuDateTimeIcon,
            file: App.Modules.Tools.Icons.ContextMenuFileIcon,    
            files: App.Modules.Tools.Icons.ContextMenuFilesIcon
        }[type] ?? App.Modules.Tools.Icons.ContextMenuTextIcon;
    }

}

App.Modules.Tools.Icons = {};
App.Modules.Tools.Icons.SettingsIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2L36 11V29L20 38L4 29V11L20 2ZM20 5.78164L7.36842 12.8867V27.1133L20 34.2184L32.6315 27.1133V12.8867L20 5.78164ZM20 26.5455C18.2133 26.5455 16.4997 25.8559 15.2363 24.6283C13.973 23.4009 13.2632 21.736 13.2632 20C13.2632 18.264 13.973 16.5991 15.2363 15.3717C16.4997 14.1441 18.2133 13.4545 20 13.4545C21.7867 13.4545 23.5003 14.1441 24.7637 15.3717C26.027 16.5991 26.7368 18.264 26.7368 20C26.7368 21.736 26.027 23.4009 24.7637 24.6283C23.5003 25.8559 21.7867 26.5455 20 26.5455ZM20 23.2727C20.8934 23.2727 21.7501 22.9279 22.3818 22.3141C23.0136 21.7003 23.3685 20.8679 23.3685 20C23.3685 19.1321 23.0136 18.2997 22.3818 17.6859C21.7501 17.0721 20.8934 16.7273 20 16.7273C19.1066 16.7273 18.2499 17.0721 17.6182 17.6859C16.9864 18.2997 16.6315 19.1321 16.6315 20C16.6315 20.8679 16.9864 21.7003 17.6182 22.3141C18.2499 22.9279 19.1066 23.2727 20 23.2727Z" fill="black"/></svg>';
App.Modules.Tools.Icons.FilesIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34 2H6C3.794 2 2 3.794 2 6V34C2 36.206 3.794 38 6 38H34C36.206 38 38 36.206 38 34V6C38 3.794 36.206 2 34 2ZM6 34V6H34L34.004 34H6Z" fill="black"/><path d="M17.1429 22.8571L15.7143 21.4286L11.4286 27.1429H28.5714L21.4286 17.1429L17.1429 22.8571Z" fill="black"/><path d="M15 18.5714C16.1834 18.5714 17.1429 17.612 17.1429 16.4286C17.1429 15.2451 16.1834 14.2857 15 14.2857C13.8165 14.2857 12.8571 15.2451 12.8571 16.4286C12.8571 17.612 13.8165 18.5714 15 18.5714Z" fill="black"/></svg>';
App.Modules.Tools.Icons.RemoteFilesIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34 2H6C3.794 2 2 3.794 2 6.00002V33.9999C2 36.206 3.794 38 6 38H34C36.206 38 38 36.206 38 33.9999V6.00002C38 3.794 36.206 2 34 2ZM6 33.9999V6.00002H34L34.004 33.9999H6Z" fill="black"/><path d="M20 11.8519C16.0614 11.8519 12.8571 15.1748 12.8571 19.2593C12.8571 23.3437 16.0614 26.6667 20 26.6667C23.9386 26.6667 27.1429 23.3437 27.1429 19.2593C27.1429 15.1748 23.9386 11.8519 20 11.8519ZM25.565 21.9047H23.8227C23.9583 21.2422 24.044 20.532 24.0716 19.7883H26.101C26.041 20.5381 25.8551 21.2511 25.565 21.9047ZM14.435 16.6138H16.1773C16.0417 17.2763 15.956 17.9865 15.9284 18.7302H13.899C13.9589 17.9804 14.1449 17.2674 14.435 16.6138ZM17.9591 15.5556H17.5323C17.9973 14.2408 18.6969 13.2924 19.4899 13.003V18.7302H16.95C16.9814 17.9841 17.078 17.2702 17.228 16.6138H17.9591C18.241 16.6138 18.4694 16.3769 18.4694 16.0846C18.4694 15.7924 18.241 15.5556 17.9591 15.5556ZM22.4677 15.5556H20.5101V13.003C21.3031 13.2924 22.0027 14.2408 22.4677 15.5556ZM13.899 19.7883H15.9284C15.956 20.532 16.0417 21.2422 16.1773 21.9047H14.435C14.1449 21.2511 13.9589 20.5381 13.899 19.7883ZM16.95 19.7883H19.4899V21.9047H17.228C17.0781 21.2483 16.9814 20.5344 16.95 19.7883ZM19.4899 22.963V25.5156C18.6969 25.2261 17.9973 24.2778 17.5323 22.963H19.4899ZM20.5101 25.5156V22.963H22.4677C22.0027 24.2778 21.3031 25.2261 20.5101 25.5156ZM20.5101 21.9047V16.6138H22.772C22.9219 17.2702 23.0186 17.9841 23.0499 18.7302H22.0409C21.759 18.7302 21.5306 18.9671 21.5306 19.2593C21.5306 19.5514 21.759 19.7883 22.0409 19.7883H23.05C23.0186 20.5344 22.922 21.2483 22.7721 21.9047H20.5101ZM24.0716 18.7302C24.044 17.9865 23.9583 17.2763 23.8227 16.6138H25.565C25.855 17.2674 26.041 17.9804 26.101 18.7302H24.0716ZM24.9699 15.5556H23.5517C23.307 14.771 22.9854 14.0802 22.6044 13.514C23.5501 13.977 24.3639 14.6836 24.9699 15.5556ZM17.3956 13.514C17.0146 14.0801 16.693 14.771 16.4481 15.5556H15.0301C15.6361 14.6836 16.4499 13.977 17.3956 13.514ZM15.0301 22.963H16.4481C16.693 23.7476 17.0146 24.4384 17.3956 25.0044C16.4499 24.5415 15.6361 23.835 15.0301 22.963ZM22.6044 25.0044C22.9854 24.4384 23.307 23.7476 23.5517 22.963H24.9697C24.3639 23.835 23.5501 24.5415 22.6044 25.0044Z" fill="black"/></svg>';
App.Modules.Tools.Icons.NoticesIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 8.75C2 6.67893 3.61177 5 5.6 5H34.4C36.3883 5 38 6.67893 38 8.75V31.25C38 33.3211 36.3883 35 34.4 35H5.6C3.61177 35 2 33.3211 2 31.25V8.75ZM34.4 12.2534V31.25H5.6V12.2535L20 22.2534L34.4 12.2534ZM32.955 8.75H7.04502L20 17.7464L32.955 8.75Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ThemesIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.117 2C29.9976 2.063 38 10.1045 38 20C38 29.9346 29.9346 38 20 38C10.0655 38 2 29.9346 2 20C7.83051 21.6304 13.0821 16.4104 11 11C17.0044 12.0605 21.179 6.91701 20.117 2ZM22.25 27.5001C23.492 27.5001 24.5 28.5081 24.5 29.7501C24.5 30.9921 23.492 32.0001 22.25 32.0001C21.008 32.0001 20 30.9921 20 29.7501C20 28.5081 21.008 27.5001 22.25 27.5001ZM11.9945 23.0001C13.6505 23.0001 14.9946 24.3439 14.9946 25.9999C14.9946 27.6559 13.6505 29 11.9945 29C10.3385 29 8.99449 27.6559 8.99449 25.9999C8.99449 24.3439 10.3385 23.0001 11.9945 23.0001ZM29 18.5001C30.656 18.5001 32.0001 19.8439 32.0001 21.4999C32.0001 23.1559 30.656 24.5 29 24.5C27.344 24.5 25.9999 23.1559 25.9999 21.4999C25.9999 19.8439 27.344 18.5001 29 18.5001ZM20 16.9999C20.828 16.9999 21.4999 17.6721 21.4999 18.5001C21.4999 19.3281 20.828 20 20 20C19.172 20 18.5001 19.3281 18.5001 18.5001C18.5001 17.6721 19.172 16.9999 20 16.9999ZM6.5 12.5C7.328 12.5 7.99999 13.1721 7.99999 14.0001C7.99999 14.8281 7.328 15.5 6.5 15.5C5.672 15.5 5.00001 14.8281 5.00001 14.0001C5.00001 13.1721 5.672 12.5 6.5 12.5ZM26.75 9.50001C27.992 9.50001 29 10.508 29 11.75C29 12.9921 27.992 14.0001 26.75 14.0001C25.508 14.0001 24.5 12.9921 24.5 11.75C24.5 10.508 25.508 9.50001 26.75 9.50001ZM4.25 6.5C5.492 6.5 6.5 7.508 6.5 8.75C6.5 9.992 5.492 11 4.25 11C3.008 11 2 9.992 2 8.75C2 7.508 3.008 6.5 4.25 6.5ZM13.25 3.49999C14.492 3.49999 15.5 4.50799 15.5 5.74999C15.5 6.99199 14.492 7.99999 13.25 7.99999C12.008 7.99999 11 6.99199 11 5.74999C11 4.50799 12.008 3.49999 13.25 3.49999ZM7.99999 2C8.82799 2 9.50001 2.67199 9.50001 3.49999C9.50001 4.32799 8.82799 5.00001 7.99999 5.00001C7.17199 5.00001 6.5 4.32799 6.5 3.49999C6.5 2.67199 7.17199 2 7.99999 2Z" fill="black"/></svg>';
App.Modules.Tools.Icons.JobsIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M33.3333 24.9091C32.8913 24.9091 32.4674 25.0815 32.1549 25.3884C31.8423 25.6953 31.6667 26.1116 31.6667 26.5455V27.3637H18.3333C17.8913 27.3637 17.4674 27.1913 17.1549 26.8844C16.8423 26.5775 16.6667 26.1614 16.6667 25.7273C16.6667 25.2933 16.8423 24.8771 17.1549 24.5703C17.4674 24.2634 17.8913 24.091 18.3333 24.091H21.6667C24.3189 24.091 26.8624 23.0566 28.7377 21.2152C30.6131 19.374 31.6667 16.8767 31.6667 14.2727C31.6667 11.6688 30.6131 9.17151 28.7377 7.33023C26.8624 5.48897 24.3189 4.45455 21.6667 4.45455H8.33333V3.63637C8.33333 3.20238 8.15774 2.78616 7.84517 2.47928C7.53261 2.17241 7.1087 2 6.66667 2C6.22464 2 5.80071 2.17241 5.48816 2.47928C5.1756 2.78616 5 3.20238 5 3.63637V13.4546C5 13.8886 5.1756 14.3048 5.48816 14.6117C5.80071 14.9185 6.22464 15.0909 6.66667 15.0909C7.1087 15.0909 7.53261 14.9185 7.84517 14.6117C8.15774 14.3048 8.33333 13.8886 8.33333 13.4546V12.6364H21.6667C22.1087 12.6364 22.5326 12.8088 22.8451 13.1157C23.1577 13.4225 23.3333 13.8388 23.3333 14.2727C23.3333 14.7068 23.1577 15.1229 22.8451 15.4298C22.5326 15.7367 22.1087 15.9091 21.6667 15.9091H18.3333C15.6811 15.9091 13.1376 16.9435 11.2623 18.7848C9.3869 20.626 8.33333 23.1233 8.33333 25.7273C8.33333 28.3313 9.3869 30.8285 11.2623 32.6698C13.1376 34.511 15.6811 35.5455 18.3333 35.5455H31.6667V36.3637C31.6667 36.7977 31.8423 37.2138 32.1549 37.5207C32.4674 37.8276 32.8913 38 33.3333 38C33.7754 38 34.1993 37.8276 34.5119 37.5207C34.8244 37.2138 35 36.7977 35 36.3637V26.5455C35 26.1116 34.8244 25.6953 34.5119 25.3884C34.1993 25.0815 33.7754 24.9091 33.3333 24.9091Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ExecuteIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34.4 4H5.6C3.6146 4 2 5.59467 2 7.55556V32.4444C2 34.4053 3.6146 36 5.6 36H34.4C36.3854 36 38 34.4053 38 32.4444V7.55556C38 5.59467 36.3854 4 34.4 4ZM5.6 32.4444V11.1111H34.4L34.4036 32.4444H5.6Z" fill="black"/><path d="M16.1329 16.1329L10.8371 21.4286L16.1329 26.7243L18.1529 24.7043L14.8771 21.4286L18.1529 18.1529L16.1329 16.1329ZM23.8671 16.1329L21.8471 18.1529L25.1229 21.4286L21.8471 24.7043L23.8671 26.7243L29.1629 21.4286L23.8671 16.1329Z" fill="black"/></svg>';
App.Modules.Tools.Icons.BackupIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.9833 27.1393L7.7 17.9876L5 20L20 31.1801L35 20L32.2833 17.9716L19.9833 27.1393Z" fill="black"/><path d="M19.9833 33.9592L7.7 24.8075L5 26.8199L20 38L35 26.8199L32.2833 24.7915L19.9833 33.9592Z" fill="black"/><path d="M20 24.3602L32.2667 15.2085L35 13.1801L20 2L5 13.1801L7.71667 15.2085L20 24.3602Z" fill="black"/></svg>';
App.Modules.Tools.Icons.SettingsRootIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.65403 9.82069H27.0173C27.055 9.82069 27.2998 8 28.2749 8H36.4645C37.8372 8 38 9.82069 38 9.82069L37.6588 12.1379C37.6588 12.1379 34.2831 28.6271 33.564 32H6.43602C5.81839 29.413 3.5381 20.816 2 14.6207H29.128C29.9769 18.1131 32.3697 27.3655 32.3697 27.3655C32.3697 27.3655 34.0525 12.1379 33.9709 12.1379H8.65403V9.82069Z" fill="black"/></svg>';
App.Modules.Tools.Icons.FolderIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.65403 9.82069H27.0173C27.055 9.82069 27.2998 8 28.2749 8H36.4645C37.8372 8 38 9.82069 38 9.82069L37.6588 12.1379C37.6588 12.1379 34.2831 28.6271 33.564 32H6.43602C5.81839 29.413 3.5381 20.816 2 14.6207H29.128C29.9769 18.1131 32.3697 27.3655 32.3697 27.3655C32.3697 27.3655 34.0525 12.1379 33.9709 12.1379H8.65403V9.82069Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ThemesCurrentIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.2601 2C27.5555 2.04214 33.0506 5.65279 36 11C33.4205 15.5 33.4205 15.5803 32.5631 17.4694C23.9888 17.4694 12.8422 27.8593 21.1486 38C19.6685 38 18.232 37.8027 16.8615 37.4319C9.46861 35.4316 4 28.3808 4 20C9.55473 21.6304 14.5579 16.4104 12.5743 11C18.2947 12.0605 22.2718 6.91701 21.2601 2ZM13.5218 23.0001C15.0994 23.0001 16.3799 24.3439 16.3799 25.9999C16.3799 27.6559 15.0994 29 13.5218 29C11.9441 29 10.6637 27.6559 10.6637 25.9999C10.6637 24.3439 11.9441 23.0001 13.5218 23.0001ZM21.1486 16.9999C21.9374 16.9999 22.5776 17.6721 22.5776 18.5001C22.5776 19.3281 21.9374 20 21.1486 20C20.3598 20 19.7196 19.3281 19.7196 18.5001C19.7196 17.6721 20.3598 16.9999 21.1486 16.9999ZM8.28715 12.5C9.07599 12.5 9.7162 13.1721 9.7162 14.0001C9.7162 14.8281 9.07599 15.5 8.28715 15.5C7.49832 15.5 6.85811 14.8281 6.85811 14.0001C6.85811 13.1721 7.49832 12.5 8.28715 12.5ZM27.5793 9.50001C28.7626 9.50001 29.7229 10.508 29.7229 11.75C29.7229 12.9921 28.7626 14.0001 27.5793 14.0001C26.3961 14.0001 25.4358 12.9921 25.4358 11.75C25.4358 10.508 26.3961 9.50001 27.5793 9.50001ZM6.14358 6.5C7.32683 6.5 8.28715 7.508 8.28715 8.75C8.28715 9.992 7.32683 11 6.14358 11C4.96032 11 4 9.992 4 8.75C4 7.508 4.96032 6.5 6.14358 6.5ZM14.7179 3.49999C15.9011 3.49999 16.8615 4.50799 16.8615 5.74999C16.8615 6.99199 15.9011 7.99999 14.7179 7.99999C13.5346 7.99999 12.5743 6.99199 12.5743 5.74999C12.5743 4.50799 13.5346 3.49999 14.7179 3.49999ZM9.7162 2C10.505 2 11.1453 2.67199 11.1453 3.49999C11.1453 4.32799 10.505 5.00001 9.7162 5.00001C8.92736 5.00001 8.28715 4.32799 8.28715 3.49999C8.28715 2.67199 8.92736 2 9.7162 2Z" fill="black"/><path d="M21.4346 25.6283L25.7017 30.2666L24.4825 31.5917L20.2154 26.9536L21.4346 25.6283Z" fill="black"/><path d="M24.4825 28.9413L31.7974 20.9901L33.0166 22.3153L25.7017 30.2666L24.4825 28.9413Z" fill="black"/></svg>';
App.Modules.Tools.Icons.BucketIcon = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.7922 8.64933C33.4291 8.64933 37.999 9.79964 37.999 11.2185C37.8638 11.8222 37.7795 12.4356 37.747 13.0527C37.747 13.6784 37.9994 13.903 37.999 13.9092C37.917 15.3103 33.3781 15.7434 27.7922 15.7434C22.2062 15.7434 17.6671 15.5542 17.5853 14.1525C17.7582 13.8104 17.8446 13.4329 17.8373 13.0514C17.811 12.4338 17.7266 11.8198 17.5853 11.2172C17.5853 9.79964 22.1556 8.64933 27.7922 8.64933Z" fill="white"/><path d="M27.7922 15.3781C33.4291 15.3781 37.999 16.5284 37.999 17.9472C37.7835 18.4957 37.656 19.0735 37.621 19.66C37.6496 20.0148 37.7807 20.3544 37.999 20.6392C37.917 22.0403 33.3781 22.4744 27.7922 22.4744C22.2062 22.4744 17.6671 22.2851 17.5853 20.8835C17.8196 20.5154 17.9501 20.0933 17.9634 19.66C17.9288 19.0734 17.8013 18.4956 17.5853 17.9472C17.5853 16.5284 22.1556 15.3781 27.7922 15.3781Z" fill="white"/><path d="M27.4769 4.00041C30.5679 3.98656 33.4394 4.31859 35.6347 5.21698C36.4997 5.57053 37.535 6.05659 37.8929 6.89901C38.0599 7.29206 37.9817 8.10865 37.9817 8.6503V10.1747C38.0019 10.4287 37.9976 10.6839 37.9691 10.9371C37.9233 11.1456 37.8348 11.343 37.709 11.5173C37.0771 12.4026 35.7448 12.8757 34.5756 13.2371C30.9532 14.3569 24.9107 14.3975 21.2429 13.2813C20.0003 12.9034 18.4882 12.3868 17.8812 11.404C17.794 11.2596 17.7318 11.1021 17.6972 10.9378C17.6729 10.7287 17.6687 10.5177 17.6845 10.3078V7.81218C17.6608 7.5161 17.6866 7.21821 17.7611 6.93027C18.0338 6.24095 18.7221 5.83817 19.3659 5.51288C20.2371 5.10637 21.1518 4.79577 22.0932 4.5868L23.2475 4.35996C23.728 4.25645 24.2337 4.2426 24.7318 4.15838L26.1462 4.04496L26.6918 4.01969L27.4769 4.00041ZM27.3691 5.68882L26.8808 5.70136L25.5488 5.78333L24.5846 5.89039C23.7037 6.05191 22.8544 6.17507 22.1236 6.4706C21.751 6.62033 20.7762 7.03321 21.147 7.62352C21.5001 8.18595 22.6215 8.43656 23.386 8.62522C23.8712 8.74501 24.4009 8.79367 24.9273 8.88351L25.6123 8.94658L26.3165 8.99693C26.8559 9.04949 27.3986 9.06426 27.9402 9.0411C29.281 9.06487 30.6206 8.94874 31.9362 8.69466C32.6998 8.52921 33.4344 8.38097 34.0166 8.03959C34.2464 7.9052 34.5191 7.74911 34.5874 7.45938C34.6026 7.36987 34.5937 7.27804 34.5614 7.19296C34.5292 7.10788 34.4748 7.0325 34.4036 6.97425C34.0802 6.69458 33.6964 6.48986 33.2808 6.37533C31.6384 5.80392 29.5713 5.69181 27.3691 5.68882ZM18.0388 13.2425C18.1887 13.3569 18.2939 13.5341 18.4448 13.6521C18.7846 13.9231 19.1577 14.1516 19.5555 14.3324C20.0968 14.5655 20.6517 14.7674 21.2173 14.9371C24.4716 15.9431 30.0122 16.0601 33.5162 15.1765C34.8073 14.8506 36.0034 14.5083 36.9476 13.8476C37.2045 13.6839 37.4318 13.4796 37.62 13.2429L37.6453 13.2616L37.7722 13.4507C37.8668 13.6048 37.9353 13.7729 37.9752 13.9483L37.9815 16.5686C37.9815 17.1825 38.0244 17.732 37.7912 18.112C37.1949 19.0837 35.7805 19.5833 34.5691 19.958C30.9235 21.0849 24.8829 21.1081 21.2046 19.9894C20.2542 19.7002 19.3772 19.389 18.6548 18.8807C18.4748 18.7699 18.3106 18.6365 18.1663 18.4837C17.9792 18.2886 17.8327 18.0597 17.7351 17.8099C17.6257 17.4655 17.6843 16.9072 17.6843 16.481L17.6906 13.9485C17.756 13.6924 17.8745 13.4521 18.0388 13.2425ZM18.0325 19.9643C18.1409 20.0585 18.2406 20.1618 18.3306 20.273C18.5547 20.4592 18.792 20.6298 19.0407 20.7834C19.9294 21.3123 21.0152 21.6196 22.1487 21.9047C22.9557 22.1077 23.8147 22.1689 24.6922 22.3205L25.7579 22.4141L27.1342 22.477H28.1428L28.7644 22.4645L29.386 22.4457C29.8728 22.3692 30.385 22.4049 30.8511 22.326L31.4538 22.2631C32.0424 22.1547 32.6411 22.1027 33.1916 21.967C33.8403 21.8364 34.4799 21.6659 35.1066 21.4566C35.7586 21.235 36.3805 20.9367 36.9588 20.5683C37.1263 20.4515 37.2833 20.3209 37.4281 20.1779C37.4837 20.0964 37.5522 20.024 37.6311 19.9636L37.7579 20.1401C37.8608 20.296 37.9339 20.4689 37.9737 20.6503L37.9808 23.2782C37.9808 23.9146 38.0233 24.463 37.7778 24.8532C37.1734 25.8137 35.715 26.323 34.4986 26.699C30.7724 27.8506 24.6696 27.7943 20.9946 26.6485C19.8278 26.2848 18.4716 25.7823 17.8866 24.8532C17.6411 24.4632 17.6836 23.9146 17.6836 23.2782L17.6899 20.6512C17.7298 20.4699 17.8028 20.297 17.9055 20.141L18.0325 19.9643Z" fill="black"/><path d="M27.8563 5.59135C31.6505 5.59135 34.7261 6.35872 34.7261 7.30595C34.7261 8.25319 31.6505 9.02056 27.8563 9.02056C24.0622 9.02056 20.9865 8.25319 20.9865 7.30595C20.9865 6.35872 24.0622 5.59135 27.8563 5.59135Z" fill="white"/><path d="M14.6788 12.8254C21.5941 12.8254 27.2 14.2426 27.2 15.9909C27.2 15.9993 26.8908 17.3791 26.891 18.252C26.891 19.023 27.2006 19.3002 27.2 19.3073C27.0995 21.0337 21.5317 21.5684 14.6788 21.5684C7.82585 21.5684 2.25749 21.3352 2.15733 19.6088C2.36929 19.187 2.47525 18.7219 2.46641 18.252C2.43411 17.4907 2.33066 16.7339 2.15733 15.9909C2.15733 14.2426 7.76342 12.8254 14.6788 12.8254Z" fill="white"/><path d="M14.6788 21.1162C21.5941 21.1162 27.2 22.5334 27.2 24.2817C27.2 24.2912 26.7362 25.4366 26.7364 26.3921C26.7364 27.0137 27.2004 27.5916 27.2 27.598C27.0995 29.3244 21.5317 29.8591 14.6788 29.8591C7.82585 29.8591 2.25749 29.6259 2.15733 27.8995C2.44479 27.4456 2.60477 26.9257 2.62114 26.3921C2.62114 25.4344 2.15733 24.2901 2.15733 24.2817C2.15733 22.5334 7.76342 21.1162 14.6788 21.1162Z" fill="white"/><path d="M14.2594 7.09761C18.1231 7.08058 21.7125 7.48935 24.4555 8.5908C25.5367 9.02483 26.8301 9.62189 27.278 10.6565C27.4869 11.1394 27.3891 12.142 27.3891 12.8072V14.6789C27.4142 14.9906 27.4088 15.3039 27.3732 15.6147C27.3153 15.8709 27.2045 16.1129 27.0476 16.3259C26.2581 17.4131 24.5924 17.9941 23.1309 18.4378C18.603 19.8131 11.0497 19.862 6.46507 18.4921C4.91184 18.028 3.02175 17.3937 2.26285 16.1866C2.15415 16.0096 2.07648 15.8161 2.03305 15.6141C2.00268 15.3573 1.99735 15.0982 2.01716 14.8404V11.7782C2.01716 11.3818 1.99954 10.9749 2.11291 10.6951C2.45396 9.84854 3.31417 9.35387 4.11884 8.95446C5.13378 8.45062 6.29751 8.1214 7.5275 7.81726L8.97101 7.53782C9.57155 7.41074 10.2039 7.39389 10.8262 7.2902L12.5943 7.15095L13.2763 7.12007L14.2594 7.09761ZM14.1254 9.17101L13.5149 9.18654L11.8498 9.28705L10.6447 9.41806C9.54225 9.61646 8.48192 9.7675 7.56848 10.1293C7.10276 10.314 5.8833 10.8201 6.34749 11.545C6.78889 12.2358 8.19123 12.5435 9.14623 12.775C9.7527 12.9221 10.4159 12.9809 11.0729 13.0923L11.9283 13.1714L12.8092 13.2334C13.4837 13.2979 14.162 13.316 14.8391 13.2875C16.6271 13.2875 18.3377 13.1804 19.8341 12.8621C20.7887 12.659 21.7069 12.4767 22.4346 12.0573C22.7219 11.8922 23.0627 11.7005 23.1482 11.346C23.167 11.2357 23.1556 11.1226 23.1153 11.0179C23.0749 10.9133 23.007 10.821 22.9184 10.7503C22.557 10.3958 22.0528 10.1993 21.5149 10.0153C19.462 9.31213 16.8776 9.17475 14.1254 9.17101ZM2.46316 18.4472C2.65044 18.5876 2.78181 18.8052 2.97062 18.9501C3.39618 19.2834 3.86224 19.564 4.35822 19.7856C5.03547 20.072 5.72908 20.32 6.43558 20.5283C10.5036 21.7635 17.4293 21.9082 21.809 20.8223C23.4231 20.4222 24.9182 20.0016 26.0986 19.1899C26.4189 18.9895 26.7029 18.7386 26.939 18.4472L26.9708 18.4704L27.1294 18.7025C27.2475 18.8913 27.3332 19.0977 27.3831 19.3136C27.3857 20.3867 27.3883 21.4597 27.391 22.5328C27.391 23.2867 27.4448 23.9616 27.1531 24.4282C26.4076 25.6215 24.6401 26.2351 23.1254 26.6951C18.5677 28.079 11.0177 28.1076 6.41988 26.7337C5.23259 26.3781 4.1355 25.9964 3.23259 25.3721C3.00808 25.2368 2.80281 25.0732 2.6221 24.8854C2.38861 24.6467 2.20544 24.3654 2.08303 24.0576C1.9463 23.6348 2.01965 22.9492 2.01965 22.4252C2.02233 21.3887 2.02495 20.352 2.0275 19.3151C2.10914 18.9995 2.25697 18.704 2.46162 18.4472H2.46316ZM2.4553 26.702C2.56771 26.747 2.72091 26.9968 2.82796 27.081C3.10858 27.31 3.4053 27.5195 3.71593 27.7079C4.82662 28.3573 6.18415 28.7346 7.60104 29.0848C8.60965 29.3341 9.68281 29.4095 10.7799 29.5956L12.112 29.7116L13.8326 29.7889H15.0932L15.8703 29.7734L16.6472 29.7502C17.2556 29.6566 17.8959 29.7 18.4787 29.6033L19.2318 29.5258C19.9678 29.3927 20.7157 29.3289 21.4044 29.1623C22.2393 28.9602 23.0491 28.8192 23.7981 28.5357C24.6323 28.2199 25.436 27.9098 26.1131 27.4447C26.3223 27.3014 26.5186 27.1409 26.6999 26.965C26.7696 26.8648 26.8553 26.776 26.9536 26.702L27.1122 26.9186C27.2404 27.1097 27.3318 27.3221 27.3818 27.5454C27.3843 28.6207 27.387 29.6961 27.3896 30.7715C27.3896 31.5531 27.4429 32.2264 27.1359 32.7055C26.3804 33.8846 24.5576 34.5107 23.0378 34.9724C18.3802 36.3866 10.7517 36.3176 6.15791 34.9105C4.69946 34.4637 3.00414 33.8466 2.273 32.7055C1.9666 32.2265 2.01926 31.5529 2.01926 30.7715L2.02558 27.5456C2.07568 27.3224 2.16705 27.1099 2.29521 26.9188L2.4553 26.702Z" fill="black"/><path d="M14.754 9.05792C19.4061 9.05792 23.1772 10.0025 23.1772 11.1678C23.1772 12.3331 19.4061 13.2777 14.754 13.2777C10.102 13.2777 6.33083 12.3331 6.33083 11.1687C6.33083 10.0044 10.1022 9.05792 14.754 9.05792Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuIntegerIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 11C2 8.79086 3.79086 7 6 7H22C24.2091 7 26 8.79086 26 11V17C26 19.2091 24.2091 21 22 21H6C3.79086 21 2 19.2091 2 17V11Z" fill="#E0E0E0"/><path d="M13.2496 17.691H10.1818V17.0674H11.3227V12.9726H10.1818V12.4146C10.6128 12.4146 10.9297 12.3558 11.1326 12.2382C11.3382 12.1178 11.4537 11.8922 11.4791 11.5612H12.134V17.0674H13.2496V17.691Z" fill="black"/><path d="M18.2948 17.691H14.4116V16.8335C14.6905 16.5764 14.9538 16.3302 15.2017 16.0949C15.4496 15.8597 15.6918 15.6149 15.9286 15.3605C16.4074 14.849 16.7342 14.4401 16.9088 14.1337C17.0836 13.8246 17.1709 13.506 17.1709 13.1778C17.1709 13.0081 17.1426 12.8591 17.0864 12.7306C17.0328 12.602 16.9582 12.4953 16.8624 12.4105C16.7637 12.3284 16.6497 12.2669 16.5201 12.2259C16.3906 12.1848 16.2483 12.1643 16.0934 12.1643C15.944 12.1643 15.7919 12.1835 15.637 12.2218C15.4849 12.2573 15.3384 12.3025 15.1975 12.3572C15.0791 12.4037 14.9651 12.4597 14.8553 12.5254C14.7454 12.591 14.6566 12.6471 14.589 12.6936H14.5426V11.8238C14.7172 11.739 14.9595 11.6569 15.2693 11.5776C15.582 11.4956 15.8778 11.4545 16.1568 11.4545C16.7426 11.4545 17.2018 11.6063 17.5342 11.9099C17.8667 12.2108 18.0329 12.6198 18.0329 13.1367C18.0329 13.3747 18.0032 13.5949 17.9441 13.7972C17.8878 13.9997 17.8089 14.1871 17.7075 14.3594C17.6032 14.5372 17.4779 14.7136 17.3314 14.8887C17.1849 15.0637 17.03 15.2361 16.8666 15.4056C16.6018 15.6847 16.3061 15.9746 15.9792 16.2755C15.6553 16.5764 15.3961 16.8144 15.2017 16.9894H18.2948V17.691Z" fill="black"/><path d="M20.8344 12.1643C20.6822 12.1643 20.5301 12.1821 20.378 12.2177C20.2259 12.2532 20.0766 12.2997 19.9301 12.3572C19.7949 12.4119 19.6766 12.4693 19.5752 12.5295C19.4765 12.5897 19.3878 12.6458 19.3089 12.6977H19.2583V11.832C19.4413 11.7363 19.6892 11.6501 20.0019 11.5735C20.3174 11.4942 20.6174 11.4545 20.902 11.4545C21.1865 11.4545 21.4344 11.4833 21.6457 11.5407C21.8597 11.5954 22.0527 11.6816 22.2246 11.7992C22.4104 11.9305 22.5499 12.0891 22.6428 12.2751C22.7387 12.4611 22.7865 12.6786 22.7865 12.9275C22.7865 13.264 22.6725 13.5594 22.4443 13.8137C22.2161 14.0681 21.9428 14.2295 21.6245 14.2978V14.3553C21.7569 14.3799 21.8978 14.4223 22.0471 14.4825C22.1992 14.5427 22.3401 14.6315 22.4696 14.7492C22.5992 14.8668 22.7048 15.0185 22.7865 15.2046C22.8682 15.3879 22.9091 15.6121 22.9091 15.8775C22.9091 16.1537 22.8598 16.4081 22.7612 16.6406C22.6654 16.8704 22.5288 17.0741 22.3514 17.2519C22.1682 17.438 21.947 17.5788 21.6879 17.6746C21.4288 17.7703 21.1344 17.8182 20.8048 17.8182C20.4893 17.8182 20.1765 17.7813 19.8668 17.7074C19.5569 17.6335 19.2963 17.5447 19.0851 17.4407V16.575H19.1441C19.3217 16.7008 19.5597 16.8211 19.8582 16.936C20.1568 17.051 20.4555 17.1084 20.7541 17.1084C20.9259 17.1084 21.0977 17.0824 21.2696 17.0303C21.4442 16.9757 21.5893 16.8882 21.7048 16.7678C21.8175 16.6475 21.9034 16.5148 21.9626 16.3698C22.0217 16.2248 22.0513 16.0416 22.0513 15.82C22.0513 15.5985 22.0175 15.4165 21.9498 15.2744C21.8851 15.1321 21.7935 15.0199 21.6752 14.9379C21.5569 14.8559 21.4161 14.7998 21.2526 14.7697C21.0921 14.7369 20.9174 14.7205 20.7288 14.7205H20.3695V14.0393H20.6485C21.0288 14.0393 21.3371 13.9519 21.5739 13.7767C21.8133 13.6017 21.933 13.3473 21.933 13.0136C21.933 12.8605 21.902 12.7292 21.84 12.6198C21.778 12.5076 21.6992 12.4187 21.6034 12.3531C21.4964 12.282 21.378 12.2327 21.2484 12.2054C21.1189 12.178 20.9808 12.1643 20.8344 12.1643Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ContextMenuDoubleIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 11C2 8.79086 3.79086 7 6 7H22C24.2091 7 26 8.79086 26 11V17C26 19.2091 24.2091 21 22 21H6C3.79086 21 2 19.2091 2 17V11Z" fill="#E0E0E0"/><path d="M9.6709 17.5959H6.36363V16.9818H7.59361V12.9495H6.36363V12.4C6.82829 12.4 7.16996 12.3421 7.38861 12.2262C7.61031 12.1077 7.73483 11.8855 7.76216 11.5596H8.46825V16.9818H9.6709V17.5959Z" fill="black"/><path d="M12.7049 16.4444L11.4293 19.0909H10.7642L11.566 16.4444H12.7049Z" fill="black"/><path d="M17.9345 17.5959H13.748V16.7515C14.0487 16.4983 14.3327 16.2559 14.6 16.0243C14.8672 15.7926 15.1284 15.5514 15.3835 15.301C15.8998 14.7973 16.2521 14.3947 16.4403 14.0929C16.6286 13.7886 16.7227 13.4747 16.7227 13.1515C16.7227 12.9845 16.6925 12.8377 16.6316 12.7111C16.574 12.5845 16.4935 12.4794 16.3902 12.3959C16.2839 12.3151 16.161 12.2545 16.0212 12.2141C15.8815 12.1737 15.7281 12.1535 15.5611 12.1535C15.4001 12.1535 15.2362 12.1724 15.0691 12.2101C14.9052 12.2451 14.7472 12.2895 14.5954 12.3434C14.4679 12.3892 14.3448 12.4444 14.2264 12.5091C14.1079 12.5737 14.0122 12.6289 13.9394 12.6747H13.8893V11.8182C14.0775 11.7347 14.3388 11.6539 14.6728 11.5757C15.0099 11.4949 15.3289 11.4545 15.6295 11.4545C16.2611 11.4545 16.7562 11.604 17.1145 11.903C17.4729 12.1993 17.6521 12.602 17.6521 13.1111C17.6521 13.3454 17.6201 13.5623 17.5564 13.7616C17.4957 13.9609 17.4107 14.1455 17.3013 14.3151C17.1889 14.4902 17.0538 14.664 16.8958 14.8363C16.7379 15.0087 16.5709 15.1784 16.3948 15.3454C16.1093 15.6202 15.7905 15.9058 15.4382 16.2021C15.0888 16.4983 14.8095 16.7327 14.6 16.905H17.9345V17.5959Z" fill="black"/><path d="M20.6724 12.1535C20.5083 12.1535 20.3444 12.171 20.1804 12.206C20.0163 12.2411 19.8554 12.2869 19.6975 12.3434C19.5518 12.3973 19.4241 12.4539 19.3148 12.5131C19.2085 12.5724 19.1129 12.6276 19.0278 12.6788H18.9732V11.8262C19.1706 11.732 19.4379 11.6471 19.7749 11.5717C20.1151 11.4936 20.4385 11.4545 20.7452 11.4545C21.0519 11.4545 21.3192 11.4828 21.547 11.5394C21.7778 11.5932 21.9859 11.6781 22.1712 11.7939C22.3715 11.9232 22.5219 12.0795 22.6221 12.2626C22.7253 12.4458 22.777 12.6599 22.777 12.9051C22.777 13.2363 22.654 13.5273 22.408 13.7778C22.162 14.0282 21.8674 14.1872 21.5242 14.2545V14.311C21.6669 14.3353 21.8189 14.3771 21.9797 14.4364C22.1438 14.4956 22.2956 14.5831 22.4354 14.699C22.575 14.8148 22.6889 14.9643 22.777 15.1475C22.8651 15.3279 22.9091 15.5488 22.9091 15.8101C22.9091 16.0822 22.8559 16.3326 22.7496 16.5616C22.6464 16.7879 22.4991 16.9885 22.3077 17.1636C22.1103 17.3467 21.8719 17.4855 21.5926 17.5798C21.3132 17.6741 20.9958 17.7212 20.6405 17.7212C20.3004 17.7212 19.9632 17.6848 19.6291 17.6121C19.2951 17.5394 19.0142 17.4519 18.7863 17.3494V16.4969H18.8501C19.0415 16.6209 19.2981 16.7394 19.62 16.8525C19.942 16.9657 20.2639 17.0222 20.5859 17.0222C20.771 17.0222 20.9563 16.9966 21.1415 16.9455C21.3299 16.8916 21.4863 16.8053 21.6108 16.6868C21.7322 16.5683 21.8249 16.4376 21.8886 16.295C21.9524 16.1522 21.9843 15.9717 21.9843 15.7535C21.9843 15.5353 21.9479 15.3562 21.875 15.2162C21.8051 15.0761 21.7065 14.9656 21.5788 14.8848C21.4513 14.804 21.2995 14.7489 21.1233 14.7192C20.9502 14.6869 20.762 14.6707 20.5585 14.6707H20.1712V14H20.4719C20.8819 14 21.2145 13.9138 21.4695 13.7414C21.7277 13.569 21.8568 13.3186 21.8568 12.9898C21.8568 12.839 21.8233 12.7097 21.7565 12.602C21.6897 12.4916 21.6047 12.404 21.5015 12.3394C21.386 12.2693 21.2585 12.2209 21.1187 12.1939C20.9791 12.167 20.8302 12.1535 20.6724 12.1535Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ContextMenuTextIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="24" height="14" rx="4" fill="#E0E0E0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6 10H9V18H6V10Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ContextMenuTextAreaIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8C2 5.79086 3.79086 4 6 4H22C24.2091 4 26 5.79086 26 8V20C26 22.2091 24.2091 24 22 24H6C3.79086 24 2 22.2091 2 20V8Z" fill="#E0E0E0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6 7H9V21H6V7Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ContextMenuHtmlIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8C2 5.79086 3.79086 4 6 4H22C24.2091 4 26 5.79086 26 8V20C26 22.2091 24.2091 24 22 24H6C3.79086 24 2 22.2091 2 20V8Z" fill="#E0E0E0"/><path d="M13.1292 10H15.2727L12.3254 18.8421H10.1818L13.1292 10Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ContextMenuHtmlCodeIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8C2 5.79086 3.79086 4 6 4H22C24.2091 4 26 5.79086 26 8V20C26 22.2091 24.2091 24 22 24H6C3.79086 24 2 22.2091 2 20V8Z" fill="#E0E0E0"/><path d="M14.2262 18.9091C13.6341 18.9091 13.091 18.8213 12.5969 18.6458C12.1071 18.4701 11.6812 18.1993 11.3191 17.8331C10.9613 17.4668 10.6823 17.0079 10.4821 16.456C10.2819 15.8992 10.1818 15.2447 10.1818 14.4922C10.1818 13.6845 10.2904 12.9973 10.5077 12.4304C10.7249 11.8636 11.0188 11.3971 11.3894 11.0309C11.7472 10.6797 12.1667 10.4214 12.6481 10.2558C13.1337 10.0853 13.6384 10 14.1623 10C14.5585 10 14.9546 10.0552 15.3506 10.1655C15.7468 10.2709 16.1451 10.4414 16.5455 10.6772V12.9346H16.258C16.1685 12.8342 16.0578 12.7239 15.9258 12.6035C15.798 12.4831 15.6574 12.3727 15.504 12.2724C15.3422 12.1671 15.159 12.0793 14.9546 12.0091C14.7502 11.9338 14.5222 11.8962 14.271 11.8962C13.7002 11.8962 13.2571 12.132 12.942 12.6035C12.631 13.07 12.4755 13.6996 12.4755 14.4922C12.4755 15.34 12.6417 15.972 12.9739 16.3883C13.3104 16.8048 13.7555 17.0129 14.3093 17.0129C14.5904 17.0129 14.8375 16.9753 15.0504 16.9001C15.2633 16.8247 15.4465 16.7345 15.5998 16.6291C15.749 16.5237 15.8768 16.4159 15.9832 16.3056C16.0897 16.1902 16.1813 16.0873 16.258 15.9971H16.5455V18.2544C16.4177 18.3197 16.2686 18.3949 16.0982 18.4802C15.9321 18.5655 15.7617 18.6357 15.5871 18.6908C15.3698 18.7611 15.1654 18.8138 14.9738 18.8489C14.7863 18.889 14.5371 18.9091 14.2262 18.9091Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ContextMenuFileIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6C3 3.79086 4.79086 2 7 2H21C23.2091 2 25 3.79086 25 6V22C25 24.2091 23.2091 26 21 26H7C4.79086 26 3 24.2091 3 22V6Z" fill="#E0E0E0"/><path d="M17.1958 7.02664H11.9831C11.7387 7.17231 11.5229 7.22343 11.3364 7.42458C10.7725 8.03279 10.9719 9.32599 11.5324 9.74206C12.0284 10.1104 13.0819 9.97615 13.8644 9.97615H17.5289C18.1185 9.97615 18.8734 10.0647 19.2927 9.8357C19.6302 9.65126 19.8993 9.2272 19.9784 8.73549C20.0918 8.03203 19.7361 7.46466 19.4298 7.23732C18.9613 6.88956 17.9318 7.02664 17.1958 7.02664Z" fill="black"/><path d="M16.229 12.0339H9.55831C9.1955 12.1571 8.89062 12.1368 8.61657 12.3128C7.74421 12.8729 7.82208 14.2492 8.69506 14.7528C9.31919 15.1131 10.7669 14.962 11.7557 14.962H16.6736C17.3597 14.962 18.379 15.0833 18.9233 14.8923C19.1918 14.7962 19.4284 14.6415 19.6113 14.4425C19.7943 14.2433 19.9176 14.0064 19.9696 13.7536C20.1372 12.9803 19.5779 12.4292 19.1064 12.1966C18.4844 11.8896 17.1392 12.0339 16.229 12.0339Z" fill="black"/><path d="M16.2602 17.0297H9.51953C9.10314 17.1768 8.80345 17.1847 8.50059 17.4022C7.655 18.009 7.97461 19.3509 8.76186 19.7767C9.39064 20.1168 10.8315 19.9629 11.7926 19.9629H16.7043C17.3836 19.9629 18.3862 20.0821 18.9251 19.8931C19.44 19.7125 19.8548 19.2881 19.9701 18.7524C20.1318 18.0033 19.6049 17.4508 19.1602 17.2159C18.5437 16.8902 17.1964 17.0297 16.2602 17.0297Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ContextMenuFilesIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6C3 3.79086 4.79086 2 7 2H21C23.2091 2 25 3.79086 25 6V22C25 24.2091 23.2091 26 21 26H7C4.79086 26 3 24.2091 3 22V6Z" fill="#E0E0E0"/><path d="M3 6C3 3.79086 4.79086 2 7 2H17C19.2091 2 21 3.79086 21 6V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V6Z" fill="#C8C8C8"/><path d="M17.1958 7.02664H11.9831C11.7387 7.17231 11.5229 7.22343 11.3364 7.42458C10.7725 8.03279 10.9719 9.32599 11.5324 9.74206C12.0284 10.1104 13.0819 9.97615 13.8644 9.97615H17.5289C18.1185 9.97615 18.8734 10.0647 19.2927 9.8357C19.6302 9.65126 19.8993 9.2272 19.9784 8.73549C20.0918 8.03203 19.7361 7.46466 19.4298 7.23732C18.9613 6.88956 17.9318 7.02664 17.1958 7.02664Z" fill="black"/><path d="M16.229 12.0339H9.55831C9.1955 12.1571 8.89062 12.1368 8.61657 12.3128C7.74421 12.8729 7.82208 14.2492 8.69506 14.7528C9.31919 15.1131 10.7669 14.962 11.7557 14.962H16.6736C17.3597 14.962 18.379 15.0833 18.9233 14.8923C19.1918 14.7962 19.4284 14.6415 19.6113 14.4425C19.7943 14.2433 19.9176 14.0064 19.9696 13.7536C20.1372 12.9803 19.5779 12.4292 19.1064 12.1966C18.4844 11.8896 17.1392 12.0339 16.229 12.0339Z" fill="black"/><path d="M16.2602 17.0297H9.51953C9.10314 17.1768 8.80345 17.1847 8.50059 17.4022C7.655 18.009 7.97461 19.3509 8.76186 19.7767C9.39064 20.1168 10.8315 19.9629 11.7926 19.9629H16.7043C17.3836 19.9629 18.3862 20.0821 18.9251 19.8931C19.44 19.7125 19.8548 19.2881 19.9701 18.7524C20.1318 18.0033 19.6049 17.4508 19.1602 17.2159C18.5437 16.8902 17.1964 17.0297 16.2602 17.0297Z" fill="black"/></svg>';


const Tools = new App.Modules.Tools();
