/**
 * Captures the platform screenshots used on the site.
 *
 * Everything it photographs is a fresh copy of the platform's example study,
 * opened for the demo account and removed again afterwards. The study and its
 * informants are invented, so no real interview data can reach the site.
 *
 * It needs a running development instance of the platform with the demo
 * account (DemoProjectSeeder creates it), and Chrome. The Puppeteer image
 * carries both Chrome and the libraries it needs, so nothing has to be
 * installed on the host; run `npm ci` first for the font, then:
 *
 *   docker run --rm --init --cap-add=SYS_ADMIN --network host \
 *     --user "$(id -u):$(id -g)" -e HOME=/tmp \
 *     -e PADIUSH_URL=http://127.0.0.1:8000 -e OUT=/out -e FONT_DIR=/fonts \
 *     -e PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
 *     -v "$PWD/scripts/capture-screenshots.mjs:/home/pptruser/capture.mjs:ro" \
 *     -v "$PWD/node_modules/@fontsource-variable/montserrat/files:/fonts:ro" \
 *     -v "$PWD/public/site/shots:/out" -w /home/pptruser \
 *     ghcr.io/puppeteer/puppeteer:25.13.0 node capture.mjs
 *
 * The script is mounted beside the image's own node_modules so that
 * `import 'puppeteer'` resolves without a local install, and SYS_ADMIN lets
 * Chrome start its sandbox inside the container. The platform must serve
 * built assets (`npm run build`, with no `public/hot`), since a Vite dev
 * server only answers the origin it was configured for. Each shot is taken in
 * both themes, because the site swaps them to match the reader rather than
 * dropping a bright screenshot into a dark page. Update src/components/shots.ts
 * if a shot's size changes.
 */

import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const BASE = process.env.PADIUSH_URL ?? 'http://localhost:8000';
const EMAIL = process.env.DEMO_EMAIL ?? 'demo@padiush.test';
const PASSWORD = process.env.DEMO_PASSWORD ?? 'demo-screenshots';
const OUT = path.resolve(process.env.OUT ?? 'public/site/shots');

// Retina, so the shots stay sharp when the page scales them down.
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };
const THEMES = ['padiushlight', 'padiushdark'];

// The site's languages. The platform reads the language from the `i18next`
// cookie, and builds the example study in it, so each language gets its own
// copy of the study as well as its own interface.
const LOCALES = ['es', 'en', 'pt'];

/**
 * Chrome renders a caret and focus ring that read as artefacts in a still,
 * and a guided tour that has not been finished would sit over the page.
 */
const HIDE_ARTEFACTS = `
    *, *::before, *::after {
        caret-color: transparent !important;
        transition: none !important;
        animation: none !important;
    }
    *:focus, *:focus-visible { outline: none !important; }
    .driver-popover, .driver-overlay { display: none !important; }
`;

async function signIn(page) {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', EMAIL);
    await page.type('input[type="password"]', PASSWORD);

    await page.click('button[type="submit"]');

    // Inertia submits over XHR and swaps the page client-side, so there is no
    // navigation event to await — watch the path instead.
    try {
        await page.waitForFunction(
            () => !window.location.pathname.startsWith('/login'),
            { timeout: 15000 },
        );
    } catch {
        const reason = await page.evaluate(
            () =>
                document.querySelector('[role="alert"]')?.textContent?.trim() ??
                'no error shown',
        );

        throw new Error(
            `Sign-in failed (${reason}). Has DemoProjectSeeder been run against this database?`,
        );
    }

    await page.waitForNetworkIdle({ idleTime: 500 });
}

/**
 * Switches the interface, and the language the platform builds the example
 * study in, the way the language toggle does: through the `i18next` cookie.
 */
async function useLanguage(page, locale) {
    await page.setCookie({ name: 'i18next', value: locale, url: BASE });
    await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle0' });
}

/**
 * Opens a fresh copy of the example study, as the "explore an example
 * project" button does, and returns its id. A fresh copy holds exactly what a
 * new account sees, never data someone added to the demo project later.
 */
async function openExampleProject(page) {
    const url = await page.evaluate(async (base) => {
        const token = decodeURIComponent(
            document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1] ?? '',
        );
        const response = await fetch(`${base}/projects/example`, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': token,
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        return response.url;
    }, BASE);

    const id = url.match(/\/projects\/(\d+)/)?.[1];

    if (!id) {
        throw new Error(`Opening the example study ended at ${url}.`);
    }

    return id;
}

/** Removes the copy again, as its "remove the example" button does. */
async function removeExampleProject(page) {
    await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle0' });
    await page.evaluate(async (base) => {
        const token = decodeURIComponent(
            document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1] ?? '',
        );
        await fetch(`${base}/projects/example`, {
            method: 'DELETE',
            headers: {
                'X-XSRF-TOKEN': token,
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
    }, BASE);
}

/**
 * The platform's theme names Montserrat but leaves loading it to the reader's
 * machine. The site ships it, so the shots are taken in it too, from the
 * site's own copy of the font.
 */
async function montserrat() {
    const dir = path.resolve(
        process.env.FONT_DIR ??
            'node_modules/@fontsource-variable/montserrat/files',
    );
    const faces = [];

    for (const subset of ['latin', 'latin-ext']) {
        const file = path.join(dir, `montserrat-${subset}-wght-normal.woff2`);
        const data = (await readFile(file)).toString('base64');
        faces.push(`@font-face {
            font-family: 'Montserrat';
            font-weight: 100 900;
            font-display: block;
            src: url(data:font/woff2;base64,${data}) format('woff2');
        }`);
    }

    return faces.join('\n');
}

/**
 * An account that has not seen the current release's notes is shown them in
 * a dialog over every page. Opening the What's new page marks them seen, as it
 * would for a person.
 */
async function dismissWhatsNew(page) {
    await page.goto(`${BASE}/whats-new`, { waitUntil: 'networkidle0' });
}

/**
 * Marks the card holding the nth sizeable chart so it can be photographed on
 * its own. The charts sit below the fold, and a full-page screenshot of a
 * report is far too tall to use as a marketing visual.
 */
async function tagChartCard(page, index) {
    const found = await page.evaluate((wanted) => {
        const cards = [...document.querySelectorAll('svg')]
            .filter((svg) => svg.getBoundingClientRect().width > 200)
            .map((svg) => svg.closest('.card'))
            .filter(Boolean);

        const card = cards[wanted];
        if (!card) return false;

        card.dataset.shot = 'target';

        return true;
    }, index);

    if (!found) {
        throw new Error(`No chart card at index ${index}.`);
    }

    return '[data-shot="target"]';
}

async function capture(
    page,
    { name, url, locale, theme, waitFor, chartIndex, fonts },
) {
    await page.evaluateOnNewDocument((value) => {
        localStorage.setItem('theme', value);
    }, theme);

    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: HIDE_ARTEFACTS + fonts });
    await page.evaluate(() => document.fonts.ready);

    if (waitFor) {
        await page.waitForSelector(waitFor, { timeout: 15000 });
    }

    // Recharts animates in; give the final frame a moment to settle.
    await new Promise((resolve) => setTimeout(resolve, 600));

    const variant = theme === 'padiushdark' ? 'dark' : 'light';
    const file = path.join(OUT, `${name}-${locale}-${variant}.webp`);
    const options = { path: file, type: 'webp', quality: 90 };

    if (chartIndex === undefined) {
        await page.screenshot(options);

        return file;
    }

    const selector = await tagChartCard(page, chartIndex);
    const card = await page.$(selector);
    await card.screenshot(options);

    return file;
}

const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: VIEWPORT,
});

try {
    await mkdir(OUT, { recursive: true });

    const page = await browser.newPage();
    await signIn(page);
    await dismissWhatsNew(page);

    const fonts = await montserrat();

    for (const locale of LOCALES) {
        await useLanguage(page, locale);

        const project = await openExampleProject(page);
        const projectUrl = `${BASE}/projects/${project}`;

        const shots = [
            {
                name: 'reports',
                url: `${projectUrl}/data/reports`,
                waitFor: 'table',
            },
            {
                name: 'sankey',
                url: `${projectUrl}/data/reports`,
                waitFor: 'table',
                chartIndex: 2,
            },
            {
                // Nothing on these lists animates in, so settling on network
                // idle is enough; the reports page needs its charts to finish
                // drawing.
                name: 'records',
                url: `${projectUrl}/records`,
            },
            {
                name: 'catalog',
                url: `${projectUrl}/catalog`,
            },
        ];

        for (const theme of THEMES) {
            for (const shot of shots) {
                const file = await capture(page, {
                    ...shot,
                    locale,
                    theme,
                    fonts,
                });
                console.log(`wrote ${path.relative(process.cwd(), file)}`);
            }
        }

        await removeExampleProject(page);
    }

    // Leave the demo account in Spanish, the language it was seeded in; the
    // platform remembers the last language each account used.
    await useLanguage(page, 'es');
} finally {
    await browser.close();
}
