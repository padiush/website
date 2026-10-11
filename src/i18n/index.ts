import en from './en.json';
import es from './es.json';
import pt from './pt.json';

/**
 * Spanish is the site's first language and lives at the root; the others sit
 * under a prefix. The order here is the order the language menu shows them in.
 */
export const LOCALES = ['es', 'en', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

/** The `lang` attribute and Open Graph locale for each language. */
export const LANGUAGE_TAGS: Record<Locale, { html: string; og: string }> = {
    es: { html: 'es', og: 'es_419' },
    en: { html: 'en', og: 'en_US' },
    pt: { html: 'pt-BR', og: 'pt_BR' },
};

/** Each language's name, written in that language. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
    es: 'Español',
    en: 'English',
    pt: 'Português (Brasil)',
};

/**
 * Every page the site builds, by language. The slugs are translated, so a page
 * cannot be found by swapping the prefix alone. The Spanish paths are the ones
 * the platform links to (`/`, `/acerca`), and they must not change.
 */
export const PAGES = {
    home: { es: '/', en: '/en', pt: '/pt' },
    about: { es: '/acerca', en: '/en/about', pt: '/pt/sobre' },
} as const satisfies Record<string, Record<Locale, string>>;
export type Page = keyof typeof PAGES;

/**
 * Pages that stay on the platform. They answer at the same paths in every
 * language, because the platform picks the language from the `i18next` cookie
 * this site sets (see LanguageCookie.astro).
 */
export const PLATFORM = {
    contact: '/contacto',
    login: '/login',
    register: '/register',
    privacy: '/privacidad',
    terms: '/terminos',
    software: '/software',
} as const;

export const APP_STORE_URL = 'https://apps.apple.com/app/id6819470290';

const STRINGS = { es, en, pt } satisfies Record<Locale, typeof es>;

type Section = keyof typeof es;
type Key = {
    [S in Section]: `${S}.${Extract<keyof (typeof es)[S], string>}`;
}[Section];

/** The path of `page` in `locale`. */
export function pagePath(page: Page, locale: Locale): string {
    return PAGES[page][locale];
}

/** Returns a lookup for `locale`'s strings, keyed as `section.key`. */
export function useTranslations(locale: Locale) {
    const strings = STRINGS[locale] as Record<string, Record<string, string>>;

    return function t(key: Key): string {
        const [section, name] = key.split('.', 2);
        return strings[section]?.[name] ?? key;
    };
}

/** Narrows a string (a route parameter, a cookie) to a supported locale. */
export function isLocale(value: unknown): value is Locale {
    return LOCALES.includes(value as Locale);
}
