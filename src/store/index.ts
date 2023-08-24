import { writable } from "svelte/store";

const initSyncData = [];

const initIi18n = {};

export const syncData = writable<Array<any>>(initSyncData);
export const i18n = writable<{ [key: string]: string}>(initIi18n);