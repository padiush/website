import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALES, PLAY_STORE_URL } from '../src/i18n';

/** Reads a PNG's size from its IHDR chunk. */
function pngSize(file: string): [number, number] {
    const data = readFileSync(file);
    return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

describe('store badges', () => {
    it.each(LOCALES)('Apple has a black and a white badge in %s', (locale) => {
        for (const colour of ['black', 'white']) {
            const file = `public/site/badges/app-store-${locale}-${colour}.svg`;
            expect(existsSync(file), file).toBe(true);
        }
    });

    // StoreBadges reserves 135×40 for the badge; a badge of another shape
    // would be squeezed or shift the layout as it loads.
    it.each(LOCALES)(
        'Google Play has a badge in %s shaped for 135×40',
        (locale) => {
            const [width, height] = pngSize(
                `public/site/badges/google-play-${locale}.png`,
            );
            expect(Math.round((width / height) * 40)).toBeGreaterThanOrEqual(
                134,
            );
            expect(Math.round((width / height) * 40)).toBeLessThanOrEqual(135);
        },
    );

    it('points at the companion on Google Play', () => {
        expect(PLAY_STORE_URL).toBe(
            'https://play.google.com/store/apps/details?id=com.padiushbio.companion',
        );
    });
});
