

App.Modules.Tools = class extends Colibri.Modules.Module {

    /** @constructor */
    constructor() {
        super('Tools');
    }

    

    InitializeModule() {

        this._pages = {};
        this._pageMap = {
            settings_manager: {
                className: 'App.Modules.Tools.SettingsManagerPage', 
                title: 'Менеджер настроек',
                color: 'blue',
                route: '/tools/settings/manager/'
            },
            settings_editor: {
                className: 'App.Modules.Tools.SettingsDataPage', 
                title: 'Настройки',
                color: 'blue',
                route: '/tools/settings/data/'
            },
            settings_files: {
                className: 'App.Modules.Tools.FilesPage', 
                title: 'Файлы на сервере',
                color: 'blue',
                route: '/tools/files/disk/'
            },
            settings_notices: {
                className: 'App.Modules.Tools.NoticesPage', 
                title: 'Шаблоны сообщений',
                color: 'blue',
                route: '/tools/settings/notices/'
            }
            
        }

        this._store = App.Store.AddChild('app.tools', {});
        this._store.AddPathLoader('tools.settings', () => this.Settings(true));
        this._store.AddPathLoader('tools.folders', () => this.Folders('', true));
        this._store.AddPathLoader('tools.files', () => this.Files('', '', true));
        this._store.AddPathLoader('tools.notices', () => this.Notices(true));

        console.log('Initializing module Tools');

        App.AddHandler('ApplicationReady', (event, args) => {
            this.Render(document.body);

        });

        Object.forEach(this._pageMap, (name, info) => {
            App.Router.AddRoutePattern(info.route, info.handle ?? ((url, options) => this.ShowPage(name)));
        });

        this.AddHandler('CallProgress', (event, args) => {
            if(args.request === 'UploadFiles') {
                if(args.event.type === 'loadstart') {
                    App.Loader.opacity = 0.5;
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

    }

    Render(container) {
        console.log('Rendering Module Tools');
        

    }

    RegisterEvents() {
        console.log('Registering module events for Tools');
        

    }

    RegisterEventHandlers() {
        console.log('Registering event handlers for Tools');

        this.AddHandler('RoutedToModule', (event, args) => {
            
        });

    }
    
    get Store() {
        return this._store;
    }

    ShowPage(name) {
        Colibri.Common.Wait(() => Security.Store.Query('security.user').id).then(() => {
            if(Security.IsCommandAllowed('Tools.' + name)) {
        
                const pageInfo = this._pageMap[name];
                const componentClass = pageInfo.className;
                const title = pageInfo.title;
                const route = pageInfo.route;

                const componentObject = eval(componentClass);
                if(!componentObject) {
                    return;
                }

                let container = null;
                if(!this._pages[componentClass]) {

                    container = MainFrame.AddTab(componentClass, title, 'orange', true, name + '-container', () => {
                        this.RemovePage(name);
                    }, route);    

                    if(!this._pages[componentClass]) {
                        this._pages[componentClass] = new componentObject(name, container);
                    }
                    if(!this._pages[componentClass].isConnected) {
                        this._pages[componentClass].ConnectTo(container);
                    }
                    this._pages[componentClass].Show();

                }
                else if(MainFrame) {
                    MainFrame.SelectTab(this._pages[componentClass].parent);
                }

            }
            else {
                App.Notices && App.Notices.Add({
                    severity: 'error',
                    title: 'Действие запрещено',
                    timeout: 5000
                });
            }
        });


    }

    RemovePage(name) {
        const pageInfo = this._pageMap[name];
        const componentClass = pageInfo.className;

        if(this._pages[componentClass]) {
            this._pages[componentClass].Dispose();
            this._pages[componentClass].parent.Dispose();
            this._pages[componentClass] = null;
        }
    }

    Settings(returnPromise = false) {
        const promise = this.Call('Settings', 'List')
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.settings', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
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

    Folders(path = '', returnPromise = false) {
        const promise = this.Call('FileManager', 'Folders', {path: path})
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.folders', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    Files(path = '', searchTerm = '', returnPromise = false) {
        const promise = this.Call('FileManager', 'Files', {path: path, term: searchTerm})
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.files', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    CreateFolder(path) {
        this.Call('FileManager', 'CreateFolder', {path: path})
            .then((response) => {
                let folders = this._store.Query('tools.folders');
                folders.push(response.result);
                this._store.Set('tools.folders', folders);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RenameFolder(pathFrom, pathTo) {
        this.Call('FileManager', 'RenameFolder', {pathFrom: pathFrom, pathTo: pathTo})
            .then((response) => {
                this._store.Set('tools.folders', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RemoveFolder(path) {
        this.Call('FileManager', 'RemoveFolder', {path: path})
            .then((response) => {
                this._store.Set('tools.folders', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RenameFile(path, nameFrom, nameTo) {
        this.Call('FileManager', 'RenameFile', {path: path, nameFrom: nameFrom, nameTo: nameTo})
            .then((response) => {
                this._store.Set('tools.files', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RemoveFile(path) {
        this.Call('FileManager', 'RemoveFile', {path: path})
            .then((response) => {
                this._store.Set('tools.files', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    UploadFiles(path, files) {
        this.Call('FileManager', 'UploadFiles', {path: path, files: files}, {}, true, 'UploadFiles')
            .then((response) => {
                let files = this._store.Query('tools.files');
                if(!Array.isArray(files)) {
                    files = [];
                }
                files = files.concat(response.result);
                this._store.Set('tools.files', files);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    Notices(returnPromise = false) {
        const promise = this.Call('Notices', 'List')
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('tools.notices', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
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
    

}

App.Modules.Tools.Icons = {};
App.Modules.Tools.Icons.SettingsRootIcon =          '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path id="folders" fill="#ff9c00" d="M61,64H168.629c0.221,0,1.656-11,7.371-11h48c8.046,0,9,11,9,11l-2,14s-19.785,99.622-24,120H48c-3.62-15.63-16.985-67.57-26-105H181c4.976,21.1,19,77,19,77s9.863-92,9.385-92H61V64Z"/></svg>';

App.Modules.Tools.Icons.ContextMenuIntegerIcon =    '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 6.00294H19.1918C19.8201 6.00294 20.4065 5.95282 20.7303 6.26662C21.0562 6.58234 20.9916 7.27532 20.9916 7.94177V15.1542C20.9916 15.6321 21.0466 16.2327 20.8755 16.5347C20.7607 16.7374 20.5471 16.9156 20.3094 16.9845C19.2015 16.9896 18.0936 16.9948 16.9856 17H5.38864C4.16472 16.9949 2.94067 16.9897 1.7165 16.9845C1.43774 16.9034 1.19593 16.6794 1.09238 16.4106C0.92679 15.9806 1.03433 14.5486 1.03433 13.9444V8.68628C1.03433 7.87838 0.888008 6.66037 1.29559 6.26662C1.43709 6.12992 1.60053 6.0991 1.78907 6.00294ZM2.86314 7.5V15.5H19.1628V7.5H2.86314Z" fill="white"/><path d="M10.4104 13.9001H8V13.4101H8.89641V10.1928H8V9.75435C8.33865 9.75435 8.58765 9.70815 8.74701 9.61573C8.90859 9.52117 8.99934 9.34386 9.01926 9.08382H9.53386V13.4101H10.4104V13.9001Z" fill="white"/><path d="M14.3745 13.9001H11.3234V13.2263C11.5425 13.0243 11.7494 12.8309 11.9442 12.646C12.139 12.4612 12.3293 12.2689 12.5153 12.069C12.8915 11.6671 13.1483 11.3458 13.2855 11.1051C13.4228 10.8622 13.4914 10.6119 13.4914 10.354C13.4914 10.2207 13.4692 10.1036 13.425 10.0026C13.3829 9.90157 13.3243 9.81775 13.249 9.75113C13.1715 9.68665 13.0819 9.6383 12.9801 9.60606C12.8783 9.57382 12.7665 9.5577 12.6448 9.5577C12.5274 9.5577 12.4079 9.57275 12.2862 9.60284C12.1667 9.63078 12.0516 9.66624 11.9409 9.70922C11.8479 9.74576 11.7583 9.78981 11.672 9.84139C11.5857 9.89297 11.5159 9.93703 11.4628 9.97357H11.4263V9.29014C11.5635 9.22351 11.7539 9.15904 11.9973 9.09671C12.243 9.03224 12.4754 9 12.6946 9C13.1549 9 13.5157 9.11928 13.7769 9.35783C14.0381 9.59424 14.1687 9.91554 14.1687 10.3217C14.1687 10.5087 14.1454 10.6817 14.0989 10.8407C14.0547 10.9998 13.9927 11.147 13.913 11.2824C13.8311 11.4221 13.7326 11.5607 13.6175 11.6983C13.5024 11.8358 13.3807 11.9712 13.2523 12.1044C13.0443 12.3237 12.8119 12.5515 12.5551 12.7879C12.3006 13.0243 12.0969 13.2113 11.9442 13.3488H14.3745V13.9001Z" fill="white"/><path d="M16.3699 9.5577C16.2503 9.5577 16.1308 9.57167 16.0113 9.59961C15.8918 9.62755 15.7745 9.66409 15.6594 9.70922C15.5531 9.7522 15.4602 9.79734 15.3805 9.84462C15.303 9.8919 15.2333 9.93596 15.1713 9.97679H15.1315V9.29658C15.2753 9.22136 15.4701 9.15366 15.7158 9.09349C15.9637 9.03116 16.1994 9 16.423 9C16.6465 9 16.8413 9.02257 17.0073 9.0677C17.1755 9.11068 17.3271 9.17838 17.4622 9.27079C17.6082 9.37395 17.7178 9.4986 17.7908 9.64475C17.8661 9.79089 17.9037 9.96175 17.9037 10.1573C17.9037 10.4217 17.8141 10.6538 17.6348 10.8536C17.4555 11.0535 17.2408 11.1803 16.9907 11.234V11.2792C17.0947 11.2985 17.2054 11.3318 17.3227 11.3791C17.4422 11.4264 17.5529 11.4962 17.6547 11.5887C17.7565 11.6811 17.8395 11.8003 17.9037 11.9465C17.9679 12.0905 18 12.2667 18 12.4752C18 12.6922 17.9613 12.8921 17.8838 13.0748C17.8085 13.2553 17.7012 13.4154 17.5618 13.5551C17.4179 13.7013 17.2441 13.8119 17.0405 13.8872C16.8369 13.9624 16.6056 14 16.3466 14C16.0987 14 15.853 13.971 15.6096 13.913C15.3661 13.8549 15.1614 13.7851 14.9954 13.7034V13.0232H15.0418C15.1813 13.1221 15.3683 13.2166 15.6029 13.3069C15.8375 13.3972 16.0722 13.4423 16.3068 13.4423C16.4418 13.4423 16.5768 13.4219 16.7118 13.381C16.849 13.3381 16.963 13.2693 17.0538 13.1747C17.1423 13.0802 17.2098 12.9759 17.2563 12.862C17.3028 12.7481 17.326 12.6041 17.326 12.43C17.326 12.256 17.2995 12.113 17.2463 12.0013C17.1954 11.8895 17.1235 11.8014 17.0305 11.7369C16.9376 11.6725 16.8269 11.6284 16.6985 11.6048C16.5724 11.579 16.4351 11.5661 16.2869 11.5661H16.0046V11.0309H16.2238C16.5226 11.0309 16.7649 10.9622 16.9509 10.8246C17.139 10.6871 17.2331 10.4872 17.2331 10.225C17.2331 10.1047 17.2087 10.0015 17.16 9.91554C17.1113 9.82742 17.0494 9.75758 16.9741 9.706C16.89 9.65012 16.797 9.61143 16.6952 9.58994C16.5934 9.56845 16.4849 9.5577 16.3699 9.5577Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuDoubleIcon =     '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 6.00294H19.1918C19.8201 6.00294 20.4065 5.95282 20.7303 6.26662C21.0562 6.58234 20.9916 7.27532 20.9916 7.94177V15.1542C20.9916 15.6321 21.0466 16.2327 20.8755 16.5347C20.7607 16.7374 20.5471 16.9156 20.3094 16.9845C19.2015 16.9896 18.0936 16.9948 16.9856 17H5.38864C4.16472 16.9949 2.94067 16.9897 1.7165 16.9845C1.43774 16.9034 1.19593 16.6794 1.09238 16.4106C0.92679 15.9806 1.03433 14.5486 1.03433 13.9444V8.68628C1.03433 7.87838 0.888008 6.66037 1.29559 6.26662C1.43709 6.12992 1.60053 6.0991 1.78907 6.00294ZM2.86314 7.5V15.5H19.1628V7.5H2.86314Z" fill="white"/><path d="M7.59857 13.8254H5V13.3429H5.96641V10.1746H5V9.74286C5.36509 9.74286 5.63354 9.69735 5.80534 9.60635C5.97953 9.51323 6.07737 9.33862 6.09884 9.08254H6.65363V13.3429H7.59857V13.8254Z" fill="white"/><path d="M9.98238 12.9206L8.98018 15H8.4576L9.08755 12.9206H9.98238Z" fill="white"/><path d="M14.0914 13.8254H10.802V13.1619C11.0383 12.963 11.2614 12.7725 11.4714 12.5905C11.6814 12.4085 11.8866 12.219 12.087 12.0222C12.4927 11.6265 12.7695 11.3101 12.9174 11.073C13.0653 10.8339 13.1393 10.5873 13.1393 10.3333C13.1393 10.2021 13.1155 10.0868 13.0677 9.9873C13.0224 9.88783 12.9592 9.80529 12.878 9.73968C12.7945 9.67619 12.6979 9.62857 12.5881 9.59683C12.4783 9.56508 12.3578 9.54921 12.2266 9.54921C12.1001 9.54921 11.9713 9.56402 11.84 9.59365C11.7112 9.62116 11.5871 9.65608 11.4678 9.69841C11.3676 9.73439 11.2709 9.77778 11.1779 9.82857C11.0848 9.87937 11.0096 9.92275 10.9524 9.95873H10.913V9.28571C11.0609 9.22011 11.2662 9.15661 11.5286 9.09524C11.7935 9.03175 12.0441 9 12.2803 9C12.7766 9 13.1656 9.11746 13.4471 9.35238C13.7287 9.58519 13.8695 9.90159 13.8695 10.3016C13.8695 10.4857 13.8444 10.6561 13.7943 10.8127C13.7466 10.9693 13.6798 11.1143 13.5939 11.2476C13.5056 11.3852 13.3994 11.5217 13.2753 11.6571C13.1512 11.7926 13.02 11.9259 12.8816 12.0571C12.6573 12.273 12.4068 12.4974 12.13 12.7302C11.8555 12.963 11.636 13.1471 11.4714 13.2825H14.0914V13.8254Z" fill="white"/><path d="M16.2426 9.54921C16.1137 9.54921 15.9849 9.56296 15.856 9.59048C15.7271 9.61799 15.6007 9.65397 15.4766 9.69841C15.3621 9.74074 15.2618 9.78519 15.1759 9.83175C15.0924 9.87831 15.0173 9.92169 14.9504 9.9619H14.9075V9.29206C15.0626 9.21799 15.2726 9.15132 15.5374 9.09206C15.8047 9.03069 16.0588 9 16.2998 9C16.5408 9 16.7508 9.02222 16.9298 9.06667C17.1111 9.10899 17.2746 9.17566 17.4202 9.26667C17.5776 9.36825 17.6958 9.49101 17.7745 9.63492C17.8556 9.77884 17.8962 9.94709 17.8962 10.1397C17.8962 10.4 17.7996 10.6286 17.6063 10.8254C17.413 11.0222 17.1815 11.1471 16.9119 11.2V11.2444C17.024 11.2635 17.1434 11.2963 17.2698 11.3429C17.3987 11.3894 17.518 11.4582 17.6278 11.5492C17.7375 11.6402 17.827 11.7577 17.8962 11.9016C17.9654 12.0434 18 12.2169 18 12.4222C18 12.636 17.9582 12.8328 17.8747 13.0127C17.7936 13.1905 17.6779 13.3481 17.5275 13.4857C17.3724 13.6296 17.1851 13.7386 16.9656 13.8127C16.7461 13.8868 16.4967 13.9238 16.2175 13.9238C15.9503 13.9238 15.6854 13.8952 15.4229 13.8381C15.1604 13.781 14.9397 13.7122 14.7607 13.6317V12.9619H14.8108C14.9612 13.0593 15.1628 13.1524 15.4157 13.2413C15.6687 13.3302 15.9216 13.3746 16.1746 13.3746C16.3201 13.3746 16.4657 13.3545 16.6112 13.3143C16.7592 13.272 16.8821 13.2042 16.9799 13.1111C17.0753 13.018 17.1481 12.9153 17.1982 12.8032C17.2483 12.691 17.2734 12.5492 17.2734 12.3778C17.2734 12.2063 17.2448 12.0656 17.1875 11.9556C17.1326 11.8455 17.0551 11.7587 16.9548 11.6952C16.8546 11.6317 16.7353 11.5884 16.5969 11.5651C16.4609 11.5397 16.313 11.527 16.1531 11.527H15.8488V11H16.0851C16.4072 11 16.6685 10.9323 16.8689 10.7968C17.0718 10.6614 17.1732 10.4646 17.1732 10.2063C17.1732 10.0878 17.1469 9.98624 17.0944 9.90159C17.0419 9.81481 16.9751 9.74603 16.894 9.69524C16.8033 9.64021 16.7031 9.60212 16.5933 9.58095C16.4836 9.55979 16.3666 9.54921 16.2426 9.54921Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuTextIcon =       '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 6.0024H19.1918C19.8201 6.0024 20.4065 5.9614 20.7303 6.21814C21.0562 6.47646 20.9916 7.04345 20.9916 7.58872V13.4898C20.9916 13.8808 21.0466 14.3722 20.8755 14.6193C20.7607 14.7851 20.5471 14.931 20.3094 14.9873C19.2015 14.9915 18.0936 14.9957 16.9856 15H5.38864C4.16472 14.9958 2.94067 14.9916 1.7165 14.9873C1.43774 14.9209 1.19593 14.7377 1.09238 14.5178C0.92679 14.166 1.03433 12.9943 1.03433 12.5V8.19787C1.03433 7.53686 0.888008 6.5403 1.29559 6.21814C1.43709 6.1063 1.60053 6.08108 1.78907 6.0024ZM2.86314 7.60141V13.401H19.1628V7.60141H2.86314ZM4.66292 8.90854H6.49173V12.0939H4.66292V8.90854Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuTextAreaIcon =   '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 3.0024H19.1918C19.8201 3.0024 20.4065 2.9614 20.7303 3.21814C21.0562 3.47646 20.9916 4.04345 20.9916 4.58872V16.4898C20.9916 16.8808 21.0466 17.3722 20.8755 17.6193C20.7607 17.7851 20.5471 17.931 20.3094 17.9873C19.2015 17.9915 18.0936 17.9957 16.9856 18H5.38864C4.16472 17.9958 2.94067 17.9916 1.7165 17.9873C1.43774 17.9209 1.19593 17.7377 1.09238 17.5178C0.92679 17.166 1.03433 15.9943 1.03433 15.5V5.19787C1.03433 4.53686 0.888008 3.5403 1.29559 3.21814C1.43709 3.1063 1.60053 3.08108 1.78907 3.0024ZM2.86314 4.60141V16.401H19.1628V4.60141H2.86314ZM4.66292 5.90854H6.49173V15.0939H4.66292V5.90854Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuHtmlIcon =       '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.73684 13.9474C6.73684 13.9474 5.57895 11.6316 5 10.4737C5.57896 9.31579 6.73684 7 6.73684 7" stroke="white" stroke-width="2"/><path d="M15 7C15 7 16.1579 9.31579 16.7368 10.4737C16.1579 11.6316 15 13.9474 15 13.9474" stroke="white" stroke-width="2"/><path d="M10.3158 7H12L9.68421 13.9474H8L10.3158 7Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 3.0024H19.1918C19.8201 3.0024 20.4065 2.9614 20.7303 3.21814C21.0562 3.47646 20.9916 4.04345 20.9916 4.58872V16.4898C20.9916 16.8808 21.0466 17.3722 20.8755 17.6193C20.7607 17.7851 20.5471 17.931 20.3094 17.9873C19.2015 17.9915 18.0936 17.9957 16.9856 18H5.38864C4.16472 17.9958 2.94067 17.9916 1.7165 17.9873C1.43774 17.9209 1.19593 17.7377 1.09238 17.5178C0.92679 17.166 1.03433 15.9943 1.03433 15.5V5.19787C1.03433 4.53686 0.888008 3.5403 1.29559 3.21814C1.43709 3.1063 1.60053 3.08108 1.78907 3.0024ZM2.86314 4.60141V16.401H19.1628V4.60141H2.86314Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuHtmlCodeIcon =   '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.73684 13.9474C6.73684 13.9474 5.57895 11.6316 5 10.4737C5.57896 9.31579 6.73684 7 6.73684 7" stroke="white" stroke-width="2"/><path d="M15 7C15 7 16.1579 9.31579 16.7368 10.4737C16.1579 11.6316 15 13.9474 15 13.9474" stroke="white" stroke-width="2"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.78907 3.0024H19.1918C19.8201 3.0024 20.4065 2.9614 20.7303 3.21814C21.0562 3.47646 20.9916 4.04345 20.9916 4.58872V16.4898C20.9916 16.8808 21.0466 17.3722 20.8755 17.6193C20.7607 17.7851 20.5471 17.931 20.3094 17.9873C19.2015 17.9915 18.0936 17.9957 16.9856 18H5.38864C4.16472 17.9958 2.94067 17.9916 1.7165 17.9873C1.43774 17.9209 1.19593 17.7377 1.09238 17.5178C0.92679 17.166 1.03433 15.9943 1.03433 15.5V5.19787C1.03433 4.53686 0.888008 3.5403 1.29559 3.21814C1.43709 3.1063 1.60053 3.08108 1.78907 3.0024ZM2.86314 4.60141V16.401H19.1628V4.60141H2.86314Z" fill="white"/><path d="M11.1777 14C10.7125 14 10.2858 13.931 9.89759 13.7931C9.51272 13.6551 9.17805 13.4423 8.89357 13.1546C8.61245 12.8668 8.39324 12.5062 8.23594 12.0726C8.07865 11.6351 8 11.1208 8 10.5296C8 9.89499 8.08534 9.35501 8.25602 8.90963C8.42671 8.46425 8.65763 8.09769 8.9488 7.80997C9.22992 7.53407 9.55957 7.33108 9.93775 7.20101C10.3193 7.067 10.7159 7 11.1275 7C11.4388 7 11.75 7.04336 12.0612 7.13007C12.3725 7.21284 12.6854 7.34685 13 7.53209V9.30574H12.7741C12.7038 9.22691 12.6168 9.1402 12.5131 9.04561C12.4127 8.95101 12.3022 8.8643 12.1817 8.78547C12.0546 8.7027 11.9106 8.63373 11.75 8.57855C11.5894 8.51943 11.4103 8.48986 11.2129 8.48986C10.7644 8.48986 10.4163 8.67511 10.1687 9.04561C9.92436 9.41216 9.80221 9.90681 9.80221 10.5296C9.80221 11.1957 9.93273 11.6923 10.1938 12.0194C10.4582 12.3466 10.8079 12.5101 11.243 12.5101C11.4639 12.5101 11.658 12.4806 11.8253 12.4215C11.9926 12.3623 12.1365 12.2914 12.257 12.2086C12.3742 12.1258 12.4746 12.0411 12.5582 11.9544C12.6419 11.8637 12.7139 11.7829 12.7741 11.712H13V13.4856C12.8996 13.5369 12.7825 13.596 12.6486 13.663C12.5181 13.73 12.3842 13.7852 12.247 13.8285C12.0763 13.8837 11.9157 13.9251 11.7651 13.9527C11.6178 13.9842 11.422 14 11.1777 14Z" fill="white"/></svg>';
App.Modules.Tools.Icons.ContextMenuFileIcon =       '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.0694 5.66268H8.24351C8.0172 5.77102 7.81747 5.80904 7.64481 5.95864C7.12271 6.41098 7.30736 7.37276 7.82624 7.6822C8.28544 7.95611 9.2608 7.8563 9.98519 7.8563H13.3778C13.9237 7.8563 14.6225 7.92217 15.0107 7.75184C15.3232 7.61467 15.5723 7.29929 15.6456 6.93359C15.7505 6.41041 15.4212 5.98845 15.1377 5.81937C14.7039 5.56073 13.7508 5.66268 13.0694 5.66268Z" fill="white"/><path d="M13.0513 9.99768H8.42494C8.17332 10.09 7.96187 10.0748 7.77181 10.2066C7.16679 10.6262 7.2208 11.6573 7.82624 12.0346C8.2591 12.3045 9.26312 12.1913 9.9489 12.1913H13.3597C13.8355 12.1913 14.5424 12.2822 14.9199 12.1391C15.1061 12.0671 15.2702 11.9512 15.3971 11.8021C15.524 11.6529 15.6095 11.4754 15.6456 11.286C15.7618 10.7067 15.3739 10.2938 15.0469 10.1196C14.6155 9.88957 13.6826 9.99768 13.0513 9.99768Z" fill="white"/><path d="M13.0694 14.3501H8.38865C8.09951 14.4601 7.8914 14.466 7.68109 14.6287C7.09391 15.0825 7.31585 16.086 7.86252 16.4044C8.29915 16.6588 9.29968 16.5437 9.96705 16.5437H13.3778C13.8495 16.5437 14.5457 16.6328 14.9199 16.4915C15.2775 16.3564 15.5655 16.039 15.6456 15.6384C15.7579 15.0782 15.392 14.665 15.0832 14.4894C14.6551 14.2458 13.7195 14.3501 13.0694 14.3501Z" fill="white"/><mask id="path-2-inside-1_90_50" fill="white"><rect x="4" y="2" width="15" height="18.2143" rx="1"/></mask><rect x="4" y="2" width="15" height="18.2143" rx="1" stroke="white" stroke-width="4" mask="url(#path-2-inside-1_90_50)"/></svg>';
App.Modules.Tools.Icons.ContextMenuFilesIcon =      '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2538 4.66139C17.156 4.65651 19.3356 4.47785 19.7217 4.93667C20.1461 5.44101 19.9588 7.34434 19.9588 8.26897V17.1503C19.9588 18.0556 20.1561 20.3438 19.6772 20.7289C19.1938 21.1176 17.6494 20.9607 16.7725 20.9607H9.19935C8.3899 20.9607 6.56087 21.1234 6.10193 20.7868C5.95334 20.6779 5.81606 20.4766 5.76106 20.2797C5.75612 19.2995 5.75118 18.3191 5.74624 17.3386C4.84393 17.3435 2.66441 17.5222 2.27832 17.0633C1.85382 16.5589 2.04119 14.6558 2.04119 13.731V4.84974C2.04119 3.94367 1.84352 1.65709 2.32278 1.27114C2.8056 0.882303 4.35104 1.03933 5.22754 1.03933H12.8007C13.6101 1.03933 15.4391 0.876595 15.8981 1.21319C16.0467 1.32217 16.184 1.52339 16.2389 1.72028C16.2438 2.70055 16.2488 3.68092 16.2538 4.66139ZM3.90854 2.86485V15.5131H5.74624V7.67495C5.74624 6.85026 5.57817 5.26631 6.02783 4.8932C6.46633 4.52936 7.59231 4.66139 8.38424 4.66139H14.3864V2.86485H3.90854ZM7.61359 6.48691V19.1352H18.0915V6.48691H7.61359ZM10.2071 8.28346H14.1493C14.7059 8.28346 15.4845 8.19861 15.8388 8.41385C16.0704 8.55456 16.3394 8.90571 16.2538 9.3411C16.1939 9.64544 15.9904 9.90789 15.7351 10.022C15.418 10.1638 14.8471 10.109 14.4012 10.109H11.6299C11.0381 10.109 10.2414 10.192 9.86626 9.96409C9.4424 9.70658 9.29156 8.90619 9.71806 8.52976C9.8591 8.40526 10.0223 8.37362 10.2071 8.28346ZM10.3553 11.891H14.1345C14.6502 11.891 15.4123 11.8011 15.7647 11.9925C16.0318 12.1375 16.3486 12.4811 16.2538 12.9632C16.2242 13.1208 16.1544 13.2685 16.0507 13.3926C15.9471 13.5168 15.813 13.6132 15.661 13.6731C15.3525 13.7922 14.7751 13.7166 14.3864 13.7166H11.6002C11.04 13.7166 10.2199 13.8107 9.86626 13.5862C9.3717 13.2721 9.32758 12.4141 9.8218 12.0649C9.97706 11.9552 10.1498 11.9678 10.3553 11.891ZM10.3257 15.5131H14.1493C14.6804 15.5131 15.4446 15.4263 15.7943 15.629C16.0466 15.7752 16.3455 16.119 16.2538 16.5852C16.1883 16.9186 15.9531 17.1827 15.661 17.2952C15.3552 17.4128 14.7866 17.3386 14.4012 17.3386H11.615C11.0699 17.3386 10.2526 17.4344 9.8959 17.2227C9.44934 16.9577 9.26804 16.1226 9.7477 15.7449C9.9195 15.6096 10.0895 15.6047 10.3257 15.5131Z" fill="white"/></svg>';

App.Modules.Tools.Icons.FolderIcon =                '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path id="folders" fill="#ff9c00" d="M61,64H168.629c0.221,0,1.656-11,7.371-11h48c8.046,0,9,11,9,11l-2,14s-19.785,99.622-24,120H48c-3.62-15.63-16.985-67.57-26-105H181c4.976,21.1,19,77,19,77s9.863-92,9.385-92H61V64Z"/></svg>';


const Tools = new App.Modules.Tools();
