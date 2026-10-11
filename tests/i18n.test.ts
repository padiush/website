import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import pt from '../src/i18n/pt.json';
import {
    LOCALES,
    PAGES,
    isLocale,
    pagePath,
    useTranslations,
} from '../src/i18n';

const flatten = (strings: Record<string, Record<string, string>>) =>
    Object.entries(strings).flatMap(([section, keys]) =>
        Object.entries(keys).map(([key, value]) => [
            `${section}.${key}`,
            value,
        ]),
    );

describe('locale files', () => {
    const spanish = flatten(es).map(([key]) => key);

    it.each([
        ['en', en],
        ['pt', pt],
    ])('%s has exactly the Spanish keys', (_, strings) => {
        expect(flatten(strings).map(([key]) => key)).toEqual(spanish);
    });

    it.each([
        ['es', es],
        ['en', en],
        ['pt', pt],
    ])('%s has no empty strings', (_, strings) => {
        const empty = flatten(strings).filter(([, value]) => !value.trim());
        expect(empty).toEqual([]);
    });

    it('no longer calls the platform a beta', () => {
        for (const strings of [es, en, pt]) {
            const text = flatten(strings).map(([, value]) => value);
            expect(text.filter((value) => /\bbeta\b/i.test(value))).toEqual([]);
        }
    });
});

describe('useTranslations', () => {
    it('looks a key up in the requested language', () => {
        expect(useTranslations('en')('nav.about')).toBe(en.nav.about);
        expect(useTranslations('pt')('nav.about')).toBe(pt.nav.about);
    });
});

describe('pages', () => {
    it('keeps the Spanish paths the platform links to', () => {
        // The platform's own pages link to these, so they must not move.
        expect(pagePath('home', 'es')).toBe('/');
        expect(pagePath('about', 'es')).toBe('/acerca');
    });

    it('gives every page a distinct path in every language', () => {
        const paths = Object.values(PAGES).flatMap((page) =>
            LOCALES.map((locale) => page[locale]),
        );
        expect(new Set(paths).size).toBe(paths.length);
    });

    it('serves every path the web servers route to the site', () => {
        // docker/nginx.conf and the production nginx configuration send these
        // prefixes to the site; a page outside them would reach the platform.
        const routed = /^\/(acerca|en(\/.*)?|pt(\/.*)?)?$/;
        for (const page of Object.values(PAGES)) {
            for (const locale of LOCALES) {
                expect(page[locale]).toMatch(routed);
            }
        }
    });

    it('recognises only the supported languages', () => {
        expect(isLocale('pt')).toBe(true);
        expect(isLocale('fr')).toBe(false);
    });
});

describe('the build configuration', () => {
    it('emits assets under the prefix the web servers route to the site', () => {
        const config = readFileSync('astro.config.mjs', 'utf8');
        expect(config).toMatch(/assets: '_site'/);
    });
});
