import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SHOTS } from '../src/components/shots';
import { LOCALES } from '../src/i18n';

/** Reads a WebP's canvas size from its VP8X, VP8 or VP8L header. */
function webpSize(file: string): [number, number] {
    const data = readFileSync(file);
    const chunk = data.toString('ascii', 12, 16);

    if (chunk === 'VP8X') {
        return [data.readUIntLE(24, 3) + 1, data.readUIntLE(27, 3) + 1];
    }
    if (chunk === 'VP8 ') {
        return [data.readUInt16LE(26) & 0x3fff, data.readUInt16LE(28) & 0x3fff];
    }
    if (chunk === 'VP8L') {
        const bits = data.readUInt32LE(21);
        return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    }

    throw new Error(`${file} is not a WebP image`);
}

describe('screenshots', () => {
    // The page reserves each shot's space from these sizes; a stale size
    // stretches the image or shifts the layout as it loads.
    it.each(Object.entries(SHOTS))(
        '%s is recorded at its real size in every language and theme',
        (name, size) => {
            for (const locale of LOCALES) {
                for (const theme of ['light', 'dark']) {
                    const file = `public/site/shots/${name}-${locale}-${theme}.webp`;
                    expect(webpSize(file), file).toEqual([...size]);
                }
            }
        },
    );
});

describe('field app screenshots', () => {
    // AppScreens reserves 603 × 1311 for each; half the simulator's
    // 1206 × 2622, so they stay sharp on a high-density screen.
    it.each(['interviews', 'record'])(
        '%s exists in every language at 603 × 1311',
        (name) => {
            for (const locale of LOCALES) {
                const file = `public/site/app/${name}-${locale}.webp`;
                expect(webpSize(file), file).toEqual([603, 1311]);
            }
        },
    );
});
