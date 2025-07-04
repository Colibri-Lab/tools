

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
            })
            .catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    SaveSetting(setting) {
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
            })
            .catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
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
        this.Call('Notices', 'Create', notice)
            .then((response) => {
                this._store.Set('tools.notices', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    
    DeleteNotice(noticeId) {
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
            })
            .catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    SaveNotice(notice) {
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
            })
            .catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
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
            })
            .catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    DeleteBackup(backupId) {
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
            })
            .catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
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
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    ImportTheme(theme) {
        this.Call('Themes', 'Import', theme)
            .then((response) => {
                let themes = this._store.Query('tools.themes');
                themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                this._store.Set('tools.themes', themes);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }
    
    DeleteTheme(themeId) {
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
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    SetThemeAsCurrent(themeId) {
        this.Call('Themes', 'SetAsCurrent', {id: themeId})
            .then((response) => {
                Tools.Themes(false);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    SaveThemeVar(themeId, varData) {
        this.Call('Themes', 'SaveVar', {id: themeId, var: varData})
            .then((response) => {
                let themes = this._store.Query('tools.themes');
                themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                this._store.Set('tools.themes', themes);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    DeleteThemeVars(themeId, varNames) {
        this.Call('Themes', 'DeleteVars', {id: themeId, vars: varNames})
            .then((response) => {
                let themes = this._store.Query('tools.themes');
                themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                this._store.Set('tools.themes', themes);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    SaveThemeMixin(themeId, mixinData) {
        this.Call('Themes', 'SaveMixin', {id: themeId, mixin: mixinData})
            .then((response) => {
                let themes = this._store.Query('tools.themes');
                themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                this._store.Set('tools.themes', themes);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    DeleteThemeMixins(themeId, mixinNames) {
        this.Call('Themes', 'DeleteMixins', {id: themeId, mixins: mixinNames})
            .then((response) => {
                let themes = this._store.Query('tools.themes');
                themes = themes.map(theme => theme.id == response.result.id ? response.result : theme);
                this._store.Set('tools.themes', themes);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
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

}

App.Modules.Tools.Icons = {};
App.Modules.Tools.Icons.SettingsIcon =              '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 3L24 8.5V19.5L14 25L4 19.5V8.5L14 3ZM14 5.311L6.10526 9.653V18.347L14 22.689L21.8947 18.347V9.653L14 5.311ZM14 18C12.8833 18 11.8123 17.5786 11.0227 16.8284C10.2331 16.0783 9.78947 15.0609 9.78947 14C9.78947 12.9391 10.2331 11.9217 11.0227 11.1716C11.8123 10.4214 12.8833 10 14 10C15.1167 10 16.1877 10.4214 16.9773 11.1716C17.7669 11.9217 18.2105 12.9391 18.2105 14C18.2105 15.0609 17.7669 16.0783 16.9773 16.8284C16.1877 17.5786 15.1167 18 14 18ZM14 16C14.5584 16 15.0938 15.7893 15.4886 15.4142C15.8835 15.0391 16.1053 14.5304 16.1053 14C16.1053 13.4696 15.8835 12.9609 15.4886 12.5858C15.0938 12.2107 14.5584 12 14 12C13.4416 12 12.9062 12.2107 12.5114 12.5858C12.1165 12.9609 11.8947 13.4696 11.8947 14C11.8947 14.5304 12.1165 15.0391 12.5114 15.4142C12.9062 15.7893 13.4416 16 14 16Z" fill="#2E3A59"/></svg>';
App.Modules.Tools.Icons.FilesIcon =                 '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 5H7C5.897 5 5 5.897 5 7V21C5 22.103 5.897 23 7 23H21C22.103 23 23 22.103 23 21V7C23 5.897 22.103 5 21 5ZM7 21V7H21L21.002 21H7Z" fill="#2E3A59"/><path d="M12 16L11 15L8 19H20L15 12L12 16Z" fill="#2E3A59"/><path d="M10.5 13C11.3284 13 12 12.3284 12 11.5C12 10.6716 11.3284 10 10.5 10C9.67157 10 9 10.6716 9 11.5C9 12.3284 9.67157 13 10.5 13Z" fill="#2E3A59"/></svg>';
App.Modules.Tools.Icons.RemoteFilesIcon =           '<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 4.76414H7C5.897 4.76414 5 5.61883 5 6.66981V20.0094C5 21.0604 5.897 21.9151 7 21.9151H21C22.103 21.9151 23 21.0604 23 20.0094V6.66981C23 5.61883 22.103 4.76414 21 4.76414ZM7 20.0094V6.66981H21L21.002 20.0094H7Z" fill="#2E3A59"/><path d="M14 8C11.243 8 9 10.243 9 13C9 15.757 11.243 18 14 18C16.757 18 19 15.757 19 13C19 10.243 16.757 8 14 8ZM17.8955 14.7857H16.6759C16.7708 14.3385 16.8308 13.8591 16.8501 13.3571H18.2707C18.2287 13.8632 18.0986 14.3445 17.8955 14.7857ZM10.1045 11.2143H11.3241C11.2292 11.6615 11.1692 12.1409 11.1499 12.6429H9.72929C9.77125 12.1368 9.90143 11.6555 10.1045 11.2143ZM12.5714 10.5H12.2726C12.5981 9.61254 13.0878 8.97237 13.6429 8.77701V12.6429H11.865C11.887 12.1393 11.9546 11.6574 12.0596 11.2143H12.5714C12.7687 11.2143 12.9286 11.0544 12.9286 10.8571C12.9286 10.6599 12.7687 10.5 12.5714 10.5ZM15.7274 10.5H14.3571V8.77701C14.9122 8.97237 15.4019 9.61254 15.7274 10.5ZM9.72929 13.3571H11.1499C11.1692 13.8591 11.2292 14.3385 11.3241 14.7857H10.1045C9.90143 14.3445 9.77125 13.8632 9.72929 13.3571ZM11.865 13.3571H13.6429V14.7857H12.0596C11.9547 14.3426 11.887 13.8607 11.865 13.3571ZM13.6429 15.5V17.223C13.0878 17.0276 12.5981 16.3875 12.2726 15.5H13.6429ZM14.3571 17.223V15.5H15.7274C15.4019 16.3875 14.9122 17.0276 14.3571 17.223ZM14.3571 14.7857V11.2143H15.9404C16.0453 11.6574 16.113 12.1393 16.1349 12.6429H15.4286C15.2313 12.6429 15.0714 12.8028 15.0714 13C15.0714 13.1972 15.2313 13.3571 15.4286 13.3571H16.135C16.113 13.8607 16.0454 14.3426 15.9405 14.7857H14.3571ZM16.8501 12.6429C16.8308 12.1409 16.7708 11.6615 16.6759 11.2143H17.8955C18.0985 11.6555 18.2287 12.1368 18.2707 12.6429H16.8501ZM17.4789 10.5H16.4862C16.3149 9.97045 16.0898 9.50411 15.8231 9.12196C16.4851 9.43446 17.0547 9.91143 17.4789 10.5ZM12.1769 9.12196C11.9102 9.50406 11.6851 9.9704 11.5137 10.5H10.5211C10.9453 9.91143 11.5149 9.43446 12.1769 9.12196ZM10.5211 15.5H11.5137C11.6851 16.0296 11.9102 16.4959 12.1769 16.878C11.5149 16.5655 10.9453 16.0886 10.5211 15.5ZM15.8231 16.878C16.0898 16.4959 16.3149 16.0296 16.4862 15.5H17.4788C17.0547 16.0886 16.4851 16.5655 15.8231 16.878Z" fill="#2E3A59"/></svg>';
App.Modules.Tools.Icons.NoticesIcon =               '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 8C4 6.89543 4.89543 6 6 6H22C23.1046 6 24 6.89543 24 8V20C24 21.1046 23.1046 22 22 22H6C4.89543 22 4 21.1046 4 20V8ZM22 9.8685V20H6V9.86851L14 15.2018L22 9.8685ZM21.1972 8H6.80279L14 12.7981L21.1972 8Z" fill="#2E3A59"/></svg>';
App.Modules.Tools.Icons.ThemesIcon =                '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.065 4C19.5542 4.035 24 8.5025 24 14C24 19.5192 19.5192 24 14 24C8.48083 24 4 19.5192 4 14C7.23917 14.9058 10.1567 12.0058 9 9C12.3358 9.58917 14.655 6.73167 14.065 4ZM15.25 18.1667C15.94 18.1667 16.5 18.7267 16.5 19.4167C16.5 20.1067 15.94 20.6667 15.25 20.6667C14.56 20.6667 14 20.1067 14 19.4167C14 18.7267 14.56 18.1667 15.25 18.1667ZM9.5525 15.6667C10.4725 15.6667 11.2192 16.4133 11.2192 17.3333C11.2192 18.2533 10.4725 19 9.5525 19C8.6325 19 7.88583 18.2533 7.88583 17.3333C7.88583 16.4133 8.6325 15.6667 9.5525 15.6667ZM19 13.1667C19.92 13.1667 20.6667 13.9133 20.6667 14.8333C20.6667 15.7533 19.92 16.5 19 16.5C18.08 16.5 17.3333 15.7533 17.3333 14.8333C17.3333 13.9133 18.08 13.1667 19 13.1667ZM14 12.3333C14.46 12.3333 14.8333 12.7067 14.8333 13.1667C14.8333 13.6267 14.46 14 14 14C13.54 14 13.1667 13.6267 13.1667 13.1667C13.1667 12.7067 13.54 12.3333 14 12.3333ZM6.5 9.83333C6.96 9.83333 7.33333 10.2067 7.33333 10.6667C7.33333 11.1267 6.96 11.5 6.5 11.5C6.04 11.5 5.66667 11.1267 5.66667 10.6667C5.66667 10.2067 6.04 9.83333 6.5 9.83333ZM17.75 8.16667C18.44 8.16667 19 8.72667 19 9.41667C19 10.1067 18.44 10.6667 17.75 10.6667C17.06 10.6667 16.5 10.1067 16.5 9.41667C16.5 8.72667 17.06 8.16667 17.75 8.16667ZM5.25 6.5C5.94 6.5 6.5 7.06 6.5 7.75C6.5 8.44 5.94 9 5.25 9C4.56 9 4 8.44 4 7.75C4 7.06 4.56 6.5 5.25 6.5ZM10.25 4.83333C10.94 4.83333 11.5 5.39333 11.5 6.08333C11.5 6.77333 10.94 7.33333 10.25 7.33333C9.56 7.33333 9 6.77333 9 6.08333C9 5.39333 9.56 4.83333 10.25 4.83333ZM7.33333 4C7.79333 4 8.16667 4.37333 8.16667 4.83333C8.16667 5.29333 7.79333 5.66667 7.33333 5.66667C6.87333 5.66667 6.5 5.29333 6.5 4.83333C6.5 4.37333 6.87333 4 7.33333 4Z" fill="#2E3A59"/></svg>';
App.Modules.Tools.Icons.JobsIcon =                  '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.3333 17.5C23.0239 17.5 22.7272 17.6229 22.5084 17.8417C22.2896 18.0605 22.1667 18.3573 22.1667 18.6667V19.25H12.8333C12.5239 19.25 12.2272 19.1271 12.0084 18.9083C11.7896 18.6895 11.6667 18.3928 11.6667 18.0833C11.6667 17.7739 11.7896 17.4772 12.0084 17.2584C12.2272 17.0396 12.5239 16.9167 12.8333 16.9167H15.1667C17.0232 16.9167 18.8037 16.1792 20.1164 14.8664C21.4292 13.5537 22.1667 11.7732 22.1667 9.91667C22.1667 8.06016 21.4292 6.27968 20.1164 4.96692C18.8037 3.65417 17.0232 2.91667 15.1667 2.91667H5.83333V2.33334C5.83333 2.02392 5.71042 1.72717 5.49162 1.50838C5.27283 1.28959 4.97609 1.16667 4.66667 1.16667C4.35725 1.16667 4.0605 1.28959 3.84171 1.50838C3.62292 1.72717 3.5 2.02392 3.5 2.33334V9.33334C3.5 9.64276 3.62292 9.9395 3.84171 10.1583C4.0605 10.3771 4.35725 10.5 4.66667 10.5C4.97609 10.5 5.27283 10.3771 5.49162 10.1583C5.71042 9.9395 5.83333 9.64276 5.83333 9.33334V8.75H15.1667C15.4761 8.75 15.7728 8.87292 15.9916 9.09171C16.2104 9.31051 16.3333 9.60725 16.3333 9.91667C16.3333 10.2261 16.2104 10.5228 15.9916 10.7416C15.7728 10.9604 15.4761 11.0833 15.1667 11.0833H12.8333C10.9768 11.0833 9.19634 11.8208 7.88359 13.1336C6.57083 14.4463 5.83333 16.2268 5.83333 18.0833C5.83333 19.9399 6.57083 21.7203 7.88359 23.0331C9.19634 24.3458 10.9768 25.0833 12.8333 25.0833H22.1667V25.6667C22.1667 25.9761 22.2896 26.2728 22.5084 26.4916C22.7272 26.7104 23.0239 26.8333 23.3333 26.8333C23.6428 26.8333 23.9395 26.7104 24.1583 26.4916C24.3771 26.2728 24.5 25.9761 24.5 25.6667V18.6667C24.5 18.3573 24.3771 18.0605 24.1583 17.8417C23.9395 17.6229 23.6428 17.5 23.3333 17.5Z" fill="black"/></svg>';
App.Modules.Tools.Icons.ExecuteIcon =               '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 5H6C4.897 5 4 5.897 4 7V21C4 22.103 4.897 23 6 23H22C23.103 23 24 22.103 24 21V7C24 5.897 23.103 5 22 5ZM6 21V9H22L22.002 21H6Z" fill="#2E3A59"/><path d="M11.293 11.293L7.586 15L11.293 18.707L12.707 17.293L10.414 15L12.707 12.707L11.293 11.293ZM16.707 11.293L15.293 12.707L17.586 15L15.293 17.293L16.707 18.707L20.414 15L16.707 11.293Z" fill="#2E3A59"/></svg>';
App.Modules.Tools.Icons.BackupIcon =                '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.99 18.74L6.62 13.01L5 14.27L14 21.27L23 14.27L21.37 13L13.99 18.74Z" fill="#2E3A59"/><path d="M13.99 23.01L6.62 17.28L5 18.54L14 25.54L23 18.54L21.37 17.27L13.99 23.01Z" fill="#2E3A59"/><path d="M14 17L21.36 11.27L23 10L14 3L5 10L6.63 11.27L14 17Z" fill="#2E3A59"/></svg>';

App.Modules.Tools.Icons.SettingsRootIcon =          '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path id="folders" fill="#ff9c00" d="M61,64H168.629c0.221,0,1.656-11,7.371-11h48c8.046,0,9,11,9,11l-2,14s-19.785,99.622-24,120H48c-3.62-15.63-16.985-67.57-26-105H181c4.976,21.1,19,77,19,77s9.863-92,9.385-92H61V64Z"/></svg>';

App.Modules.Tools.Icons.ContextMenuIntegerIcon =    '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 6.00294H19.1918C19.8201 6.00294 20.4065 5.95282 20.7303 6.26662C21.0562 6.58234 20.9916 7.27532 20.9916 7.94177V15.1542C20.9916 15.6321 21.0466 16.2327 20.8755 16.5347C20.7607 16.7374 20.5471 16.9156 20.3094 16.9845C19.2015 16.9896 18.0936 16.9948 16.9856 17H5.38864C4.16472 16.9949 2.94067 16.9897 1.7165 16.9845C1.43774 16.9034 1.19593 16.6794 1.09238 16.4106C0.92679 15.9806 1.03433 14.5486 1.03433 13.9444V8.68628C1.03433 7.87838 0.888008 6.66037 1.29559 6.26662C1.43709 6.12992 1.60053 6.0991 1.78907 6.00294ZM2.86314 7.5V15.5H19.1628V7.5H2.86314Z" fill="white"/><path d="M10.4104 13.9001H8V13.4101H8.89641V10.1928H8V9.75435C8.33865 9.75435 8.58765 9.70815 8.74701 9.61573C8.90859 9.52117 8.99934 9.34386 9.01926 9.08382H9.53386V13.4101H10.4104V13.9001Z" fill="white"/><path d="M14.3745 13.9001H11.3234V13.2263C11.5425 13.0243 11.7494 12.8309 11.9442 12.646C12.139 12.4612 12.3293 12.2689 12.5153 12.069C12.8915 11.6671 13.1483 11.3458 13.2855 11.1051C13.4228 10.8622 13.4914 10.6119 13.4914 10.354C13.4914 10.2207 13.4692 10.1036 13.425 10.0026C13.3829 9.90157 13.3243 9.81775 13.249 9.75113C13.1715 9.68665 13.0819 9.6383 12.9801 9.60606C12.8783 9.57382 12.7665 9.5577 12.6448 9.5577C12.5274 9.5577 12.4079 9.57275 12.2862 9.60284C12.1667 9.63078 12.0516 9.66624 11.9409 9.70922C11.8479 9.74576 11.7583 9.78981 11.672 9.84139C11.5857 9.89297 11.5159 9.93703 11.4628 9.97357H11.4263V9.29014C11.5635 9.22351 11.7539 9.15904 11.9973 9.09671C12.243 9.03224 12.4754 9 12.6946 9C13.1549 9 13.5157 9.11928 13.7769 9.35783C14.0381 9.59424 14.1687 9.91554 14.1687 10.3217C14.1687 10.5087 14.1454 10.6817 14.0989 10.8407C14.0547 10.9998 13.9927 11.147 13.913 11.2824C13.8311 11.4221 13.7326 11.5607 13.6175 11.6983C13.5024 11.8358 13.3807 11.9712 13.2523 12.1044C13.0443 12.3237 12.8119 12.5515 12.5551 12.7879C12.3006 13.0243 12.0969 13.2113 11.9442 13.3488H14.3745V13.9001Z" fill="white"/><path d="M16.3699 9.5577C16.2503 9.5577 16.1308 9.57167 16.0113 9.59961C15.8918 9.62755 15.7745 9.66409 15.6594 9.70922C15.5531 9.7522 15.4602 9.79734 15.3805 9.84462C15.303 9.8919 15.2333 9.93596 15.1713 9.97679H15.1315V9.29658C15.2753 9.22136 15.4701 9.15366 15.7158 9.09349C15.9637 9.03116 16.1994 9 16.423 9C16.6465 9 16.8413 9.02257 17.0073 9.0677C17.1755 9.11068 17.3271 9.17838 17.4622 9.27079C17.6082 9.37395 17.7178 9.4986 17.7908 9.64475C17.8661 9.79089 17.9037 9.96175 17.9037 10.1573C17.9037 10.4217 17.8141 10.6538 17.6348 10.8536C17.4555 11.0535 17.2408 11.1803 16.9907 11.234V11.2792C17.0947 11.2985 17.2054 11.3318 17.3227 11.3791C17.4422 11.4264 17.5529 11.4962 17.6547 11.5887C17.7565 11.6811 17.8395 11.8003 17.9037 11.9465C17.9679 12.0905 18 12.2667 18 12.4752C18 12.6922 17.9613 12.8921 17.8838 13.0748C17.8085 13.2553 17.7012 13.4154 17.5618 13.5551C17.4179 13.7013 17.2441 13.8119 17.0405 13.8872C16.8369 13.9624 16.6056 14 16.3466 14C16.0987 14 15.853 13.971 15.6096 13.913C15.3661 13.8549 15.1614 13.7851 14.9954 13.7034V13.0232H15.0418C15.1813 13.1221 15.3683 13.2166 15.6029 13.3069C15.8375 13.3972 16.0722 13.4423 16.3068 13.4423C16.4418 13.4423 16.5768 13.4219 16.7118 13.381C16.849 13.3381 16.963 13.2693 17.0538 13.1747C17.1423 13.0802 17.2098 12.9759 17.2563 12.862C17.3028 12.7481 17.326 12.6041 17.326 12.43C17.326 12.256 17.2995 12.113 17.2463 12.0013C17.1954 11.8895 17.1235 11.8014 17.0305 11.7369C16.9376 11.6725 16.8269 11.6284 16.6985 11.6048C16.5724 11.579 16.4351 11.5661 16.2869 11.5661H16.0046V11.0309H16.2238C16.5226 11.0309 16.7649 10.9622 16.9509 10.8246C17.139 10.6871 17.2331 10.4872 17.2331 10.225C17.2331 10.1047 17.2087 10.0015 17.16 9.91554C17.1113 9.82742 17.0494 9.75758 16.9741 9.706C16.89 9.65012 16.797 9.61143 16.6952 9.58994C16.5934 9.56845 16.4849 9.5577 16.3699 9.5577Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuDoubleIcon =     '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 6.00294H19.1918C19.8201 6.00294 20.4065 5.95282 20.7303 6.26662C21.0562 6.58234 20.9916 7.27532 20.9916 7.94177V15.1542C20.9916 15.6321 21.0466 16.2327 20.8755 16.5347C20.7607 16.7374 20.5471 16.9156 20.3094 16.9845C19.2015 16.9896 18.0936 16.9948 16.9856 17H5.38864C4.16472 16.9949 2.94067 16.9897 1.7165 16.9845C1.43774 16.9034 1.19593 16.6794 1.09238 16.4106C0.92679 15.9806 1.03433 14.5486 1.03433 13.9444V8.68628C1.03433 7.87838 0.888008 6.66037 1.29559 6.26662C1.43709 6.12992 1.60053 6.0991 1.78907 6.00294ZM2.86314 7.5V15.5H19.1628V7.5H2.86314Z" fill="white"/><path d="M7.59857 13.8254H5V13.3429H5.96641V10.1746H5V9.74286C5.36509 9.74286 5.63354 9.69735 5.80534 9.60635C5.97953 9.51323 6.07737 9.33862 6.09884 9.08254H6.65363V13.3429H7.59857V13.8254Z" fill="white"/><path d="M9.98238 12.9206L8.98018 15H8.4576L9.08755 12.9206H9.98238Z" fill="white"/><path d="M14.0914 13.8254H10.802V13.1619C11.0383 12.963 11.2614 12.7725 11.4714 12.5905C11.6814 12.4085 11.8866 12.219 12.087 12.0222C12.4927 11.6265 12.7695 11.3101 12.9174 11.073C13.0653 10.8339 13.1393 10.5873 13.1393 10.3333C13.1393 10.2021 13.1155 10.0868 13.0677 9.9873C13.0224 9.88783 12.9592 9.80529 12.878 9.73968C12.7945 9.67619 12.6979 9.62857 12.5881 9.59683C12.4783 9.56508 12.3578 9.54921 12.2266 9.54921C12.1001 9.54921 11.9713 9.56402 11.84 9.59365C11.7112 9.62116 11.5871 9.65608 11.4678 9.69841C11.3676 9.73439 11.2709 9.77778 11.1779 9.82857C11.0848 9.87937 11.0096 9.92275 10.9524 9.95873H10.913V9.28571C11.0609 9.22011 11.2662 9.15661 11.5286 9.09524C11.7935 9.03175 12.0441 9 12.2803 9C12.7766 9 13.1656 9.11746 13.4471 9.35238C13.7287 9.58519 13.8695 9.90159 13.8695 10.3016C13.8695 10.4857 13.8444 10.6561 13.7943 10.8127C13.7466 10.9693 13.6798 11.1143 13.5939 11.2476C13.5056 11.3852 13.3994 11.5217 13.2753 11.6571C13.1512 11.7926 13.02 11.9259 12.8816 12.0571C12.6573 12.273 12.4068 12.4974 12.13 12.7302C11.8555 12.963 11.636 13.1471 11.4714 13.2825H14.0914V13.8254Z" fill="white"/><path d="M16.2426 9.54921C16.1137 9.54921 15.9849 9.56296 15.856 9.59048C15.7271 9.61799 15.6007 9.65397 15.4766 9.69841C15.3621 9.74074 15.2618 9.78519 15.1759 9.83175C15.0924 9.87831 15.0173 9.92169 14.9504 9.9619H14.9075V9.29206C15.0626 9.21799 15.2726 9.15132 15.5374 9.09206C15.8047 9.03069 16.0588 9 16.2998 9C16.5408 9 16.7508 9.02222 16.9298 9.06667C17.1111 9.10899 17.2746 9.17566 17.4202 9.26667C17.5776 9.36825 17.6958 9.49101 17.7745 9.63492C17.8556 9.77884 17.8962 9.94709 17.8962 10.1397C17.8962 10.4 17.7996 10.6286 17.6063 10.8254C17.413 11.0222 17.1815 11.1471 16.9119 11.2V11.2444C17.024 11.2635 17.1434 11.2963 17.2698 11.3429C17.3987 11.3894 17.518 11.4582 17.6278 11.5492C17.7375 11.6402 17.827 11.7577 17.8962 11.9016C17.9654 12.0434 18 12.2169 18 12.4222C18 12.636 17.9582 12.8328 17.8747 13.0127C17.7936 13.1905 17.6779 13.3481 17.5275 13.4857C17.3724 13.6296 17.1851 13.7386 16.9656 13.8127C16.7461 13.8868 16.4967 13.9238 16.2175 13.9238C15.9503 13.9238 15.6854 13.8952 15.4229 13.8381C15.1604 13.781 14.9397 13.7122 14.7607 13.6317V12.9619H14.8108C14.9612 13.0593 15.1628 13.1524 15.4157 13.2413C15.6687 13.3302 15.9216 13.3746 16.1746 13.3746C16.3201 13.3746 16.4657 13.3545 16.6112 13.3143C16.7592 13.272 16.8821 13.2042 16.9799 13.1111C17.0753 13.018 17.1481 12.9153 17.1982 12.8032C17.2483 12.691 17.2734 12.5492 17.2734 12.3778C17.2734 12.2063 17.2448 12.0656 17.1875 11.9556C17.1326 11.8455 17.0551 11.7587 16.9548 11.6952C16.8546 11.6317 16.7353 11.5884 16.5969 11.5651C16.4609 11.5397 16.313 11.527 16.1531 11.527H15.8488V11H16.0851C16.4072 11 16.6685 10.9323 16.8689 10.7968C17.0718 10.6614 17.1732 10.4646 17.1732 10.2063C17.1732 10.0878 17.1469 9.98624 17.0944 9.90159C17.0419 9.81481 16.9751 9.74603 16.894 9.69524C16.8033 9.64021 16.7031 9.60212 16.5933 9.58095C16.4836 9.55979 16.3666 9.54921 16.2426 9.54921Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuTextIcon =       '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 6.0024H19.1918C19.8201 6.0024 20.4065 5.9614 20.7303 6.21814C21.0562 6.47646 20.9916 7.04345 20.9916 7.58872V13.4898C20.9916 13.8808 21.0466 14.3722 20.8755 14.6193C20.7607 14.7851 20.5471 14.931 20.3094 14.9873C19.2015 14.9915 18.0936 14.9957 16.9856 15H5.38864C4.16472 14.9958 2.94067 14.9916 1.7165 14.9873C1.43774 14.9209 1.19593 14.7377 1.09238 14.5178C0.92679 14.166 1.03433 12.9943 1.03433 12.5V8.19787C1.03433 7.53686 0.888008 6.5403 1.29559 6.21814C1.43709 6.1063 1.60053 6.08108 1.78907 6.0024ZM2.86314 7.60141V13.401H19.1628V7.60141H2.86314ZM4.66292 8.90854H6.49173V12.0939H4.66292V8.90854Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuTextAreaIcon =   '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 3.0024H19.1918C19.8201 3.0024 20.4065 2.9614 20.7303 3.21814C21.0562 3.47646 20.9916 4.04345 20.9916 4.58872V16.4898C20.9916 16.8808 21.0466 17.3722 20.8755 17.6193C20.7607 17.7851 20.5471 17.931 20.3094 17.9873C19.2015 17.9915 18.0936 17.9957 16.9856 18H5.38864C4.16472 17.9958 2.94067 17.9916 1.7165 17.9873C1.43774 17.9209 1.19593 17.7377 1.09238 17.5178C0.92679 17.166 1.03433 15.9943 1.03433 15.5V5.19787C1.03433 4.53686 0.888008 3.5403 1.29559 3.21814C1.43709 3.1063 1.60053 3.08108 1.78907 3.0024ZM2.86314 4.60141V16.401H19.1628V4.60141H2.86314ZM4.66292 5.90854H6.49173V15.0939H4.66292V5.90854Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuHtmlIcon =       '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.73684 13.9474C6.73684 13.9474 5.57895 11.6316 5 10.4737C5.57896 9.31579 6.73684 7 6.73684 7" stroke="white" stroke-width="2"/><path d="M15 7C15 7 16.1579 9.31579 16.7368 10.4737C16.1579 11.6316 15 13.9474 15 13.9474" stroke="white" stroke-width="2"/><path d="M10.3158 7H12L9.68421 13.9474H8L10.3158 7Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 3.0024H19.1918C19.8201 3.0024 20.4065 2.9614 20.7303 3.21814C21.0562 3.47646 20.9916 4.04345 20.9916 4.58872V16.4898C20.9916 16.8808 21.0466 17.3722 20.8755 17.6193C20.7607 17.7851 20.5471 17.931 20.3094 17.9873C19.2015 17.9915 18.0936 17.9957 16.9856 18H5.38864C4.16472 17.9958 2.94067 17.9916 1.7165 17.9873C1.43774 17.9209 1.19593 17.7377 1.09238 17.5178C0.92679 17.166 1.03433 15.9943 1.03433 15.5V5.19787C1.03433 4.53686 0.888008 3.5403 1.29559 3.21814C1.43709 3.1063 1.60053 3.08108 1.78907 3.0024ZM2.86314 4.60141V16.401H19.1628V4.60141H2.86314Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuHtmlCodeIcon =   '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.73684 13.9474C6.73684 13.9474 5.57895 11.6316 5 10.4737C5.57896 9.31579 6.73684 7 6.73684 7" stroke="white" stroke-width="2"/><path d="M15 7C15 7 16.1579 9.31579 16.7368 10.4737C16.1579 11.6316 15 13.9474 15 13.9474" stroke="white" stroke-width="2"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 3.0024H19.1918C19.8201 3.0024 20.4065 2.9614 20.7303 3.21814C21.0562 3.47646 20.9916 4.04345 20.9916 4.58872V16.4898C20.9916 16.8808 21.0466 17.3722 20.8755 17.6193C20.7607 17.7851 20.5471 17.931 20.3094 17.9873C19.2015 17.9915 18.0936 17.9957 16.9856 18H5.38864C4.16472 17.9958 2.94067 17.9916 1.7165 17.9873C1.43774 17.9209 1.19593 17.7377 1.09238 17.5178C0.92679 17.166 1.03433 15.9943 1.03433 15.5V5.19787C1.03433 4.53686 0.888008 3.5403 1.29559 3.21814C1.43709 3.1063 1.60053 3.08108 1.78907 3.0024ZM2.86314 4.60141V16.401H19.1628V4.60141H2.86314Z" fill="white"/><path d="M11.1777 14C10.7125 14 10.2858 13.931 9.89759 13.7931C9.51272 13.6551 9.17805 13.4423 8.89357 13.1546C8.61245 12.8668 8.39324 12.5062 8.23594 12.0726C8.07865 11.6351 8 11.1208 8 10.5296C8 9.89499 8.08534 9.35501 8.25602 8.90963C8.42671 8.46425 8.65763 8.09769 8.9488 7.80997C9.22992 7.53407 9.55957 7.33108 9.93775 7.20101C10.3193 7.067 10.7159 7 11.1275 7C11.4388 7 11.75 7.04336 12.0612 7.13007C12.3725 7.21284 12.6854 7.34685 13 7.53209V9.30574H12.7741C12.7038 9.22691 12.6168 9.1402 12.5131 9.04561C12.4127 8.95101 12.3022 8.8643 12.1817 8.78547C12.0546 8.7027 11.9106 8.63373 11.75 8.57855C11.5894 8.51943 11.4103 8.48986 11.2129 8.48986C10.7644 8.48986 10.4163 8.67511 10.1687 9.04561C9.92436 9.41216 9.80221 9.90681 9.80221 10.5296C9.80221 11.1957 9.93273 11.6923 10.1938 12.0194C10.4582 12.3466 10.8079 12.5101 11.243 12.5101C11.4639 12.5101 11.658 12.4806 11.8253 12.4215C11.9926 12.3623 12.1365 12.2914 12.257 12.2086C12.3742 12.1258 12.4746 12.0411 12.5582 11.9544C12.6419 11.8637 12.7139 11.7829 12.7741 11.712H13V13.4856C12.8996 13.5369 12.7825 13.596 12.6486 13.663C12.5181 13.73 12.3842 13.7852 12.247 13.8285C12.0763 13.8837 11.9157 13.9251 11.7651 13.9527C11.6178 13.9842 11.422 14 11.1777 14Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuFileIcon =       '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.0694 5.66268H8.24351C8.0172 5.77102 7.81747 5.80904 7.64481 5.95864C7.12271 6.41098 7.30736 7.37276 7.82624 7.6822C8.28544 7.95611 9.2608 7.8563 9.98519 7.8563H13.3778C13.9237 7.8563 14.6225 7.92217 15.0107 7.75184C15.3232 7.61467 15.5723 7.29929 15.6456 6.93359C15.7505 6.41041 15.4212 5.98845 15.1377 5.81937C14.7039 5.56073 13.7508 5.66268 13.0694 5.66268Z" fill="white"/><path d="M13.0513 9.99768H8.42494C8.17332 10.09 7.96187 10.0748 7.77181 10.2066C7.16679 10.6262 7.2208 11.6573 7.82624 12.0346C8.2591 12.3045 9.26312 12.1913 9.9489 12.1913H13.3597C13.8355 12.1913 14.5424 12.2822 14.9199 12.1391C15.1061 12.0671 15.2702 11.9512 15.3971 11.8021C15.524 11.6529 15.6095 11.4754 15.6456 11.286C15.7618 10.7067 15.3739 10.2938 15.0469 10.1196C14.6155 9.88957 13.6826 9.99768 13.0513 9.99768Z" fill="white"/><path d="M13.0694 14.3501H8.38865C8.09951 14.4601 7.8914 14.466 7.68109 14.6287C7.09391 15.0825 7.31585 16.086 7.86252 16.4044C8.29915 16.6588 9.29968 16.5437 9.96705 16.5437H13.3778C13.8495 16.5437 14.5457 16.6328 14.9199 16.4915C15.2775 16.3564 15.5655 16.039 15.6456 15.6384C15.7579 15.0782 15.392 14.665 15.0832 14.4894C14.6551 14.2458 13.7195 14.3501 13.0694 14.3501Z" fill="white"/><mask id="path-2-inside-1_90_50" fill="white"><rect x="4" y="2" width="15" height="18.2143" rx="1"/></mask><rect x="4" y="2" width="15" height="18.2143" rx="1" stroke="white" stroke-width="4" mask="url(#path-2-inside-1_90_50)"/></svg>';
App.Modules.Tools.Icons.ContextMenuFilesIcon =      '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2538 4.66139C17.156 4.65651 19.3356 4.47785 19.7217 4.93667C20.1461 5.44101 19.9588 7.34434 19.9588 8.26897V17.1503C19.9588 18.0556 20.1561 20.3438 19.6772 20.7289C19.1938 21.1176 17.6494 20.9607 16.7725 20.9607H9.19935C8.3899 20.9607 6.56087 21.1234 6.10193 20.7868C5.95334 20.6779 5.81606 20.4766 5.76106 20.2797C5.75612 19.2995 5.75118 18.3191 5.74624 17.3386C4.84393 17.3435 2.66441 17.5222 2.27832 17.0633C1.85382 16.5589 2.04119 14.6558 2.04119 13.731V4.84974C2.04119 3.94367 1.84352 1.65709 2.32278 1.27114C2.8056 0.882303 4.35104 1.03933 5.22754 1.03933H12.8007C13.6101 1.03933 15.4391 0.876595 15.8981 1.21319C16.0467 1.32217 16.184 1.52339 16.2389 1.72028C16.2438 2.70055 16.2488 3.68092 16.2538 4.66139ZM3.90854 2.86485V15.5131H5.74624V7.67495C5.74624 6.85026 5.57817 5.26631 6.02783 4.8932C6.46633 4.52936 7.59231 4.66139 8.38424 4.66139H14.3864V2.86485H3.90854ZM7.61359 6.48691V19.1352H18.0915V6.48691H7.61359ZM10.2071 8.28346H14.1493C14.7059 8.28346 15.4845 8.19861 15.8388 8.41385C16.0704 8.55456 16.3394 8.90571 16.2538 9.3411C16.1939 9.64544 15.9904 9.90789 15.7351 10.022C15.418 10.1638 14.8471 10.109 14.4012 10.109H11.6299C11.0381 10.109 10.2414 10.192 9.86626 9.96409C9.4424 9.70658 9.29156 8.90619 9.71806 8.52976C9.8591 8.40526 10.0223 8.37362 10.2071 8.28346ZM10.3553 11.891H14.1345C14.6502 11.891 15.4123 11.8011 15.7647 11.9925C16.0318 12.1375 16.3486 12.4811 16.2538 12.9632C16.2242 13.1208 16.1544 13.2685 16.0507 13.3926C15.9471 13.5168 15.813 13.6132 15.661 13.6731C15.3525 13.7922 14.7751 13.7166 14.3864 13.7166H11.6002C11.04 13.7166 10.2199 13.8107 9.86626 13.5862C9.3717 13.2721 9.32758 12.4141 9.8218 12.0649C9.97706 11.9552 10.1498 11.9678 10.3553 11.891ZM10.3257 15.5131H14.1493C14.6804 15.5131 15.4446 15.4263 15.7943 15.629C16.0466 15.7752 16.3455 16.119 16.2538 16.5852C16.1883 16.9186 15.9531 17.1827 15.661 17.2952C15.3552 17.4128 14.7866 17.3386 14.4012 17.3386H11.615C11.0699 17.3386 10.2526 17.4344 9.8959 17.2227C9.44934 16.9577 9.26804 16.1226 9.7477 15.7449C9.9195 15.6096 10.0895 15.6047 10.3257 15.5131Z" fill="white"/></svg>';

App.Modules.Tools.Icons.BucketIcon =                '<svg id="storages" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g><path fill="#fff" d="M168.7,67.839c29.436,0,53.3,6.146,53.3,13.727a60.332,60.332,0,0,0-1.316,9.8c0,3.343,1.318,4.543,1.316,4.576-0.428,7.486-24.13,9.8-53.3,9.8s-52.873-1.011-53.3-8.5a12.747,12.747,0,0,0,1.316-5.883,53.929,53.929,0,0,0-1.316-9.8C115.4,73.985,139.266,67.839,168.7,67.839Z"/><path fill="#fff" d="M168.7,103.79c29.436,0,53.3,6.146,53.3,13.727a30.5,30.5,0,0,0-1.974,9.151A10.045,10.045,0,0,0,222,131.9c-0.428,7.486-24.13,9.805-53.3,9.805s-52.873-1.011-53.3-8.5a13.117,13.117,0,0,0,1.974-6.537,30.319,30.319,0,0,0-1.974-9.151C115.4,109.936,139.266,103.79,168.7,103.79Z"/><path fill="#2e5468" d="M167.054,43c16.141-.074,31.136,1.7,42.6,6.5,4.517,1.889,9.923,4.486,11.792,8.987,0.872,2.1.464,6.463,0.464,9.357v8.145a21.812,21.812,0,0,1-.066,4.073,8.463,8.463,0,0,1-1.358,3.1c-3.3,4.73-10.257,7.258-16.363,9.189-18.916,5.983-50.47,6.2-69.623.236-6.489-2.019-14.385-4.779-17.555-10.03a8.135,8.135,0,0,1-.961-2.491,18.083,18.083,0,0,1-.066-3.366V63.366a14.576,14.576,0,0,1,.4-4.712c1.424-3.683,5.018-5.835,8.38-7.573a68.024,68.024,0,0,1,14.242-4.948l6.028-1.212c2.509-.553,5.15-0.627,7.751-1.077l7.386-.606,2.849-.135Zm-0.563,9.021-2.55.067-6.956.438-5.035.572c-4.6.863-9.035,1.521-12.851,3.1-1.946.8-7.036,3.006-5.1,6.16,1.844,3.005,7.7,4.344,11.692,5.352,2.534,0.64,5.3.9,8.049,1.38l3.577,0.337,3.677,0.269a59.332,59.332,0,0,0,8.479.236,98.433,98.433,0,0,0,20.867-1.851c3.988-.884,7.824-1.676,10.864-3.5,1.2-.718,2.624-1.552,2.981-3.1a2.786,2.786,0,0,0-.96-2.592,14.983,14.983,0,0,0-5.863-3.2C188.785,52.636,177.991,52.039,166.491,52.023ZM117.768,92.38c0.783,0.611,1.332,1.558,2.12,2.188a27.551,27.551,0,0,0,5.8,3.635,79.076,79.076,0,0,0,8.678,3.231c16.994,5.375,45.927,6,64.225,1.279,6.742-1.741,12.988-3.57,17.919-7.1a14.428,14.428,0,0,0,3.511-3.231l0.132,0.1,0.663,1.01a8.949,8.949,0,0,1,1.06,2.659l0.033,14c0,3.28.224,6.216-.994,8.246-3.114,5.192-10.5,7.861-16.826,9.863-19.037,6.021-50.581,6.145-69.789.168-4.963-1.545-9.543-3.208-13.315-5.924a12.607,12.607,0,0,1-2.551-2.121,11.01,11.01,0,0,1-2.252-3.6c-0.571-1.84-.265-4.823-0.265-7.1l0.033-13.531A10.3,10.3,0,0,1,117.768,92.38Zm-0.033,35.914a13,13,0,0,1,1.557,1.649A32.583,32.583,0,0,0,123,132.67c4.641,2.826,10.311,4.468,16.23,5.991,4.214,1.085,8.7,1.412,13.282,2.222l5.565,0.5,7.187,0.336h5.267l3.246-.067,3.246-.1c2.542-.409,5.217-0.218,7.651-0.64l3.147-.336c3.074-.579,6.2-0.857,9.075-1.582a82.213,82.213,0,0,0,10-2.727,44.42,44.42,0,0,0,9.672-4.746,18.83,18.83,0,0,0,2.451-2.086,4.928,4.928,0,0,1,1.06-1.145l0.662,0.943a8.2,8.2,0,0,1,1.127,2.726L221.905,146c0,3.4.222,6.33-1.06,8.415-3.156,5.132-10.772,7.853-17.124,9.862-19.458,6.153-51.327,5.852-70.518-.27-6.093-1.943-13.175-4.628-16.23-9.592-1.282-2.084-1.06-5.015-1.06-8.415l0.033-14.036a8.241,8.241,0,0,1,1.126-2.726Z"/><path fill="#fff" d="M169.035,51.5c19.813,0,35.874,4.1,35.874,9.161s-16.061,9.161-35.874,9.161-35.874-4.1-35.874-9.161S149.222,51.5,169.035,51.5Z"/></g><g><path fill="#fff" d="M100.222,90.151c36.112,0,65.386,7.572,65.386,16.913,0,0.045-1.615,7.417-1.614,12.081,0,4.119,1.617,5.6,1.614,5.638-0.525,9.224-29.6,12.081-65.386,12.081s-64.864-1.246-65.387-10.47a15.785,15.785,0,0,0,1.614-7.249,66.788,66.788,0,0,0-1.614-12.081C34.835,97.723,64.11,90.151,100.222,90.151Z"/><path fill="#fff" d="M100.222,134.448c36.112,0,65.386,7.572,65.386,16.913,0,0.051-2.422,6.171-2.421,11.276,0,3.321,2.423,6.409,2.421,6.443-0.525,9.224-29.6,12.081-65.386,12.081s-64.864-1.246-65.387-10.47a16.227,16.227,0,0,0,2.422-8.054c0-5.117-2.422-11.231-2.422-11.276C34.835,142.02,64.11,134.448,100.222,134.448Z"/><path fill="#2e5468" d="M98.032,59.548c20.176-.091,38.92,2.093,53.244,7.978,5.646,2.319,12.4,5.509,14.739,11.037,1.091,2.58.58,7.937,0.58,11.491v10a26.324,26.324,0,0,1-.083,5,10.3,10.3,0,0,1-1.7,3.8c-4.123,5.809-12.821,8.913-20.453,11.284-23.645,7.348-63.088,7.609-87.029.29-8.111-2.48-17.981-5.869-21.944-12.318a9.9,9.9,0,0,1-1.2-3.059,21.793,21.793,0,0,1-.083-4.134V84.556c0-2.118-.092-4.292.5-5.787,1.781-4.523,6.273-7.166,10.475-9.3,5.3-2.692,11.377-4.451,17.8-6.076L70.416,61.9c3.136-.679,6.438-0.769,9.688-1.323l9.233-.744,3.561-.165Zm-0.7,11.078-3.188.083-8.695.537-6.293.7c-5.757,1.06-11.294,1.867-16.064,3.8-2.432.987-8.8,3.691-6.376,7.564,2.305,3.691,9.628,5.335,14.615,6.572,3.167,0.786,6.63,1.1,10.061,1.695L85.859,92l4.6,0.331a75.48,75.48,0,0,0,10.6.289c9.337,0,18.27-.572,26.084-2.273,4.985-1.085,9.78-2.059,13.58-4.3,1.5-.882,3.28-1.906,3.726-3.8a3.389,3.389,0,0,0-1.2-3.183c-1.887-1.894-4.52-2.944-7.329-3.927C125.2,71.38,111.7,70.646,97.328,70.626Zm-60.9,49.562c0.978,0.75,1.664,1.913,2.65,2.687a34.568,34.568,0,0,0,7.246,4.464,100.108,100.108,0,0,0,10.848,3.968c21.243,6.6,57.409,7.373,80.28,1.571,8.429-2.138,16.236-4.385,22.4-8.722a17.916,17.916,0,0,0,4.389-3.968l0.166,0.124,0.828,1.24a10.853,10.853,0,0,1,1.325,3.265q0.02,8.6.041,17.2c0,4.028.281,7.634-1.242,10.127-3.893,6.376-13.123,9.654-21.033,12.112-23.8,7.394-63.226,7.547-87.236.206-6.2-1.9-11.929-3.939-16.644-7.275a15.652,15.652,0,0,1-3.188-2.6,13.455,13.455,0,0,1-2.815-4.423c-0.714-2.259-.331-5.922-0.331-8.722q0.021-8.307.041-16.617A12.553,12.553,0,0,1,36.424,120.188Zm-0.041,44.105c0.587,0.24,1.387,1.575,1.946,2.025a40.8,40.8,0,0,0,4.637,3.349c5.8,3.47,12.889,5.486,20.288,7.357,5.267,1.332,10.871,1.735,16.6,2.729l6.956,0.62,8.985,0.413h6.583l4.058-.083,4.057-.124c3.177-.5,6.521-0.268,9.564-0.785l3.933-.414c3.843-.711,7.749-1.052,11.345-1.942,4.36-1.08,8.589-1.833,12.5-3.348,4.356-1.687,8.553-3.344,12.089-5.829a23.51,23.51,0,0,0,3.064-2.563,6.11,6.11,0,0,1,1.325-1.405l0.828,1.157a10,10,0,0,1,1.408,3.349q0.02,8.618.041,17.237c0,4.176.278,7.773-1.325,10.333-3.945,6.3-13.464,9.645-21.4,12.112-24.322,7.556-64.158,7.187-88.147-.331-7.616-2.387-16.469-5.684-20.287-11.781-1.6-2.559-1.325-6.158-1.325-10.333L34.147,168.8a10.032,10.032,0,0,1,1.408-3.349Z"/><path fill="#fff" d="M100.615,70.022c24.293,0,43.986,5.047,43.986,11.273s-19.693,11.273-43.986,11.273S56.629,87.521,56.629,81.3,76.323,70.022,100.615,70.022Z"/></g></svg>';
App.Modules.Tools.Icons.FolderIcon =                '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path id="folders" fill="#ff9c00" d="M61,64H168.629c0.221,0,1.656-11,7.371-11h48c8.046,0,9,11,9,11l-2,14s-19.785,99.622-24,120H48c-3.62-15.63-16.985-67.57-26-105H181c4.976,21.1,19,77,19,77s9.863-92,9.385-92H61V64Z"/></svg>';

App.Modules.Tools.Icons.ThemesCurrentIcon =         '<svg width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.065 4C18.7361 4.02341 21.9405 6.02933 23.6604 9C22.1562 11.5 22.1562 11.5446 21.6562 12.5941C16.6562 12.5941 10.1562 18.3663 15 24C14.1369 24 13.2992 23.8904 12.5 23.6844C8.18895 22.5731 5 18.656 5 14C8.23917 14.9058 11.1567 12.0058 10 9C13.3358 9.58917 15.655 6.73167 15.065 4ZM10.5525 15.6667C11.4725 15.6667 12.2192 16.4133 12.2192 17.3333C12.2192 18.2533 11.4725 19 10.5525 19C9.6325 19 8.88583 18.2533 8.88583 17.3333C8.88583 16.4133 9.6325 15.6667 10.5525 15.6667ZM15 12.3333C15.46 12.3333 15.8333 12.7067 15.8333 13.1667C15.8333 13.6267 15.46 14 15 14C14.54 14 14.1667 13.6267 14.1667 13.1667C14.1667 12.7067 14.54 12.3333 15 12.3333ZM7.5 9.83333C7.96 9.83333 8.33333 10.2067 8.33333 10.6667C8.33333 11.1267 7.96 11.5 7.5 11.5C7.04 11.5 6.66667 11.1267 6.66667 10.6667C6.66667 10.2067 7.04 9.83333 7.5 9.83333ZM18.75 8.16667C19.44 8.16667 20 8.72667 20 9.41667C20 10.1067 19.44 10.6667 18.75 10.6667C18.06 10.6667 17.5 10.1067 17.5 9.41667C17.5 8.72667 18.06 8.16667 18.75 8.16667ZM6.25 6.5C6.94 6.5 7.5 7.06 7.5 7.75C7.5 8.44 6.94 9 6.25 9C5.56 9 5 8.44 5 7.75C5 7.06 5.56 6.5 6.25 6.5ZM11.25 4.83333C11.94 4.83333 12.5 5.39333 12.5 6.08333C12.5 6.77333 11.94 7.33333 11.25 7.33333C10.56 7.33333 10 6.77333 10 6.08333C10 5.39333 10.56 4.83333 11.25 4.83333ZM8.33333 4C8.79333 4 9.16667 4.37333 9.16667 4.83333C9.16667 5.29333 8.79333 5.66667 8.33333 5.66667C7.87333 5.66667 7.5 5.29333 7.5 4.83333C7.5 4.37333 7.87333 4 8.33333 4Z" fill="#2E3A59"/><path d="M15.5401 17.9398L18.6337 21.1866L17.7498 22.1142L14.6562 18.8675L15.5401 17.9398Z" fill="#2E3A59"/><path d="M17.7498 20.2589L23.0531 14.6931L23.937 15.6207L18.6337 21.1866L17.7498 20.2589Z" fill="#2E3A59"/></svg>';


const Tools = new App.Modules.Tools();
