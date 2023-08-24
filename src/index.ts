import { Plugin, Menu, showMessage } from "siyuan";
import "@/index.scss";
import { ExceedQueryLimitError, OpenAPI, UnauthorizedError } from "./api/openapi";
import { initDock } from "./utils/component";
import { i18n, syncData } from "./store";
import { loadIcon } from "./assets/iconDida";

const client_id = "h7KTvc0Ss71ZNVTT8j";
const client_secret = "75$4N!g&uX!C+5ZH8u34uCtPa_lWe%e5";

export default class Dida365 extends Plugin {
    config = { access_token: "", syncData: [], syncTime: 0 };
    syncing = false;

    async onload() {
        loadIcon();
        this.init();
        const icon = this.addTopBar({
            icon: "iconDida",
            title: this.i18n.title,
            callback: async () => {
                let rect = icon.getBoundingClientRect();
                if (rect.width === 0) {
                    rect = document.querySelector("#barMore").getBoundingClientRect();
                }
                if (rect.width === 0) {
                    rect = document.querySelector("#barPlugins").getBoundingClientRect();
                }
                const menu = new Menu("topBarSample");
                if (!this.config.access_token) {
                    menu.addItem({
                        icon: 'iconAccount',
                        label: this.i18n.login,
                        click: async () => {
                            await this.authorize();
                            this.sync();
                        }
                    });
                    menu.open({ x: rect.x, y: rect.y });
                    return;
                }
                menu.addItem({
                    icon: "iconAccount",
                    label: this.i18n.logout,
                    // accelerator: this.commands[0].customHotkey,
                    click: async () => {
                        this.logout();
                    },
                });
                menu.addItem({
                    icon: "iconRefresh",
                    label: this.i18n.sync,
                    // accelerator: this.commands[0].customHotkey,
                    click: async () => {
                        this.sync();
                    },
                });
                if (this.config.syncTime) {
                    menu.addSeparator();
                    menu.addItem({
                        label:
                            this.i18n.lastSyncTime +
                            ": " +
                            new Date(this.config.syncTime).toLocaleString(),
                        disabled: true,
                    });
                }
                menu.open({ x: rect.x, y: rect.y });
            },
        });
    }

    async init() {
        const conf = await this.loadConfig();
        if (conf) {
            this.config = conf;
            syncData.set(this.config.syncData);
            i18n.set(this.i18n);
            this.initDock();
        } else { 
            await this.saveConfig();
            window.location.reload();
        }

    }

    async loadConfig() {
        return await this.loadData("config.json");
    }

    async saveConfig() {
        syncData.set(this.config.syncData);
        return await this.saveData("config.json", JSON.stringify(this.config));
    }

    async sync() {
        showMessage(this.i18n.syncStart);
        const api = new OpenAPI(this.config.access_token);
        this.syncing = true;
        let d;
        try {
            d = await api.syncData();
        } catch (e) {
            if (e === UnauthorizedError) {
                showMessage(this.i18n.unauthorized, 3000, 'error');
                return;
            }
            if (e === ExceedQueryLimitError) {
                showMessage(this.i18n.exceedQueryLimit, 3000, 'error');
                return;
            }
            showMessage(this.i18n.unknownError, 3000, 'error');
            return;
        }
        this.config.syncData = d;
        this.config.syncTime = new Date().getTime();
        this.saveConfig();
        this.syncing = false;
        showMessage(this.i18n.syncStop);
    }

    async authorize() {
        if (this.config.access_token) {
            return true;
        }
        const code = await this.getNewCode();
        const access_token = await this.getAuthorizationToken(code);
        if (!access_token) {
            return false;
        }
        this.config.access_token = access_token;
        this.saveConfig();
        return true;
    }

    async logout() {
        this.config = { access_token: '', syncData: [], syncTime: 0 };
        this.saveConfig();
    }

    async getNewCode() {
        return new Promise((resolve, reject) => {
            const _req = window.require;
            const electron = _req("@electron/remote");
            const BrowserWindow = electron.BrowserWindow;

            const oauthWindow = new BrowserWindow({ width: 800, height: 600 });

            oauthWindow.loadURL(
                `https://dida365.com/oauth/authorize?scope=tasks:read%20tasks:write&client_id=${client_id}&state=state&response_type=code&redirect_uri=https://api.siyuan.com`
            );

            oauthWindow.webContents.on("will-redirect", (e) => {
                if (e.url?.startsWith("https://api.siyuan.com")) {
                    const res = /code=(.*)\&/.exec(e.url);
                    if (!res) {
                        const err = /err=(.*)\&/.exec(e.url);
                        reject({ err, url: e.url });
                        oauthWindow.close();
                        return;
                    }
                    oauthWindow.close();
                    resolve(res[1]);
                }
            });
        });
    }

    async getAuthorizationToken(code) {
        if (!code) {
            throw Error("Code is empty");
        }
        const u = new URLSearchParams();
        u.append("client_id", client_id);
        u.append("client_secret", client_secret);
        u.append("code", code);
        u.append("grant_type", "authorization_code");
        u.append("scope", "tasks:write");
        u.append("redirect_uri", "https://api.siyuan.com");
        const res = await fetch("https://dida365.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: u.toString(),
        });
        if (res.ok === true) {
            const body = await res.json();
            return body.access_token;
        }
        return "";
    }

    initDock() {
        const i18n = this.i18n;
        this.addDock({
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconDida",
                title: this.i18n.title,
            },
            data: {
                i18n: i18n,
                syncData: this.config.syncData,
            },
            type: "dida365Dock",
            init() {
                initDock(this.element, this.data);
            },
        });
    }
}
