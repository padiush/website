/**
 * The platform screenshots under public/site/shots, with their pixel sizes so
 * the page reserves their space before they load. Update a size whenever
 * scripts/capture-screenshots.mjs changes what it frames.
 */
export const SHOTS = {
    reports: [2880, 1800],
    records: [2880, 1800],
    catalog: [2880, 1800],
    sankey: [2112, 1282],
} as const satisfies Record<string, readonly [number, number]>;

export type ShotName = keyof typeof SHOTS;
