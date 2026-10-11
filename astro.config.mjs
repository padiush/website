// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

/*
 * The site shares its host with the platform: the web server sends the paths
 * this site builds to it and everything else to the platform (see
 * docs/deployment.md). Keep every page at a fixed path without a trailing
 * slash, and every asset under a prefix the platform does not use.
 */
export default defineConfig({
    site: 'https://padiushbio.com',
    trailingSlash: 'never',
    build: {
        format: 'directory',
        assets: '_site',
    },
    integrations: [
        sitemap({
            i18n: {
                defaultLocale: 'es',
                locales: { es: 'es', en: 'en', pt: 'pt-BR' },
            },
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
