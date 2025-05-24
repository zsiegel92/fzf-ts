type FzfSelection = {
    display: string;
    previewPrefix?: string;
    previewSuffix?: string;
};
export declare function getUserSelection<T extends FzfSelection>({ items, fzfArgs, getPreview, }: {
    items: T[];
    fzfArgs?: string[];
    getPreview?: ((item: T) => Promise<string>);
}): Promise<T | undefined>;
export declare function checkIfFzfIsInstalled(): Promise<boolean>;
export {};
