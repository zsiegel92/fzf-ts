export type FzfSelection = {
    display: string;
    previewPrefix?: string;
    previewSuffix?: string;
};
export declare const defaultFzfArgs: string[];
export declare function getUserSelection<T extends FzfSelection>({ items, fzfArgs, getPreview, debounceMs, previewLanguage, }: {
    items: T[];
    fzfArgs?: string[];
    getPreview?: (item: T) => Promise<string>;
    debounceMs?: number;
    previewLanguage?: string | null;
}): Promise<T | undefined>;
export declare function checkIfFzfIsInstalled(): Promise<boolean>;
