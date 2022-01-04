// TODO: do we want to use a hash based routing?
// Get the current route from the location hash to lower case prefixed with root. Example: #/ICP => /icp
export const routePath = (): string => {
    const path: string = window.location.hash.slice(2).split("/")[0].toLowerCase();
    return `/${path}`
};
