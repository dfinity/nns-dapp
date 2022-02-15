#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";

/**
 * Rollup takes care of the JS and CSS bundles. Here we copy the index.html from the source to the output folder.
 * At the same time, we also update the <base /> reference (see comment below).
 * By pre-rendering this information, we make it static and guarantee it will be set when the app - the JS code - accesses it at runtime.
 */
const copyIndex = () => {
  const buffer = readFileSync("./src/index.html");
  const content = buffer.toString("utf-8");

  let updatedContent = updateBaseHref(content);

  // Only in development mode, we remove the CSP rule
  updatedContent =
    process.env.DEV === "true" ? removeCSP(updatedContent) : updatedContent;

  writeFileSync("./public/index.html", updatedContent);
};

/**
 * Specifies where the svelte app is loaded (typically "/" in local development and "/v2" in production)
 */
const updateBaseHref = (content) =>
  content.replace(
    "<!-- BASE_HREF -->",
    `<base href="${process.env.BASE_HREF || "/v2/"}" />`
  );

/**
 * Only in development mode, remove the CSP rule.
 */
const removeCSP = (content) => {
  return content.replace(
    /<!-- CONTENT_SECURITY_POLICY_BEGIN -->((.|\r\n|\n)*)<!-- CONTENT_SECURITY_POLICY_END -->/gi,
    ""
  );
};

copyIndex();
