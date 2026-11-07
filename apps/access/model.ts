import {event, store} from '@fiberfx/hypergraph';
export type Locale = 'en' | 'ru';
export type Screen = 'login' | 'recovery';
export const localeChanged = event<Locale>({name:'access/localeChanged'});
export const themeChanged = event<boolean>({name:'access/themeChanged'});
export const screenChanged = event<Screen>({name:'access/screenChanged'});
export const $locale = store<Locale>('en', {sid:'access/preferences/locale'}).on(localeChanged, (_, v) => v);
export const $dark = store(false, {sid:'access/preferences/dark'}).on(themeChanged, (_, v) => v);
export const $screen = store<Screen>('login', {sid:'access/navigation/screen'}).on(screenChanged, (_, v) => v);
