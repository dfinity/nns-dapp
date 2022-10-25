#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { findHtmlFiles } from "./build.utils.mjs";


const buildRobots = (htmlFile) => {
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
htmlFiles.forEach((htmlFile) => buildRobots(htmlFile));