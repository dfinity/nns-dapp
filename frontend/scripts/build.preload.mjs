#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { findHtmlFiles } from "./build.utils.mjs";

/**
 * The IC does not work that well with preloading lots of module script chunks.
 * While with vite we can disable preloading, there is currently no such option with SvelteKit.
 * That's why we remove any preloading scripts "manually".
 *
 * Note: removing preloading scripts is particularly useful on static boundary nodes.
 * On VM boundary nodes it seems that preloading is better support.
 */
const removePreloadScripts = (htmlFile) => {
    const updatedIndexHTML = removePreloadedScript(htmlFile);
    writeFileSync(htmlFile, updatedIndexHTML);
};

const removePreloadedScript = (htmlFile) => {
    const content = readFileSync(htmlFile, "utf-8");

    return content.replace(
        /\s*(<link rel="(?:module)?preload".*?>)\s*/gi,
        ""
    );
};

const htmlFiles = findHtmlFiles();
htmlFiles.forEach((htmlFile) => removePreloadScripts(htmlFile));