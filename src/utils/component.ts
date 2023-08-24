import DockComponent from '../components/Dock.svelte';

export const initDock = (el, data) => {
    new DockComponent({
        target: el,
        props: {
            i18n: data.i18n,
            syncData: data.syncData,
        }
    })
}