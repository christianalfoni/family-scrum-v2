import NoSleep from 'nosleep.js';
import { PreventScreenSleep } from '.';

export const noSleep = new NoSleep()

export const createPreventScreenSleep = (): PreventScreenSleep => ({
    enable() {
        noSleep.enable()
    },
    disable() {
        noSleep.disable()
    }
})