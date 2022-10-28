#!/usr/bin/env node

import { createHash } from "crypto";
import * as dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

dotenv.config();

const buildCsp = () => {
  const indexHTMLWithoutStartScript = extractStartScript();
  const indexHTMLNoCSP = removeDefaultCspTag(indexHTMLWithoutStartScript);
  const indexHTMLWithCSP = updateCSP(indexHTMLNoCSP);
  writeFileSync("./public/index.html", indexHTMLWithCSP);
};

/**
 * Remove the empty content-security-policy tag injected by SvelteKit
 */
const removeDefaultCspTag = (indexHtml) => {
  return indexHtml.replace(
      '<meta http-equiv="content-security-policy" content="">',
      ""
  );
};

/**
 * Using a CSP with 'strict-dynamic' with SvelteKit breaks in Firefox.
 * Issue: https://github.com/sveltejs/kit/issues/3558
 *
 * As workaround:
 * 1. we extract the start script that is injected by SvelteKit in index.html into a separate main.js
 * 2. we remove the script content from index.html but, let the script tag as anchor
 * 3. we use our custom script loader to load the main.js script
 */
const extractStartScript = () => {
  const indexHtml = readFileSync(
    join(process.cwd(), "public", "index.html"),
    "utf-8"
  );

  const svelteKitStartScript =
    /(<script type=\"module\" data-sveltekit-hydrate[\s\S]*?>)([\s\S]*?)(<\/script>)/gm;

  // 1. extract SvelteKit start script to a separate main.js file
  const [_script, _scriptStartTag, content, _scriptEndTag] =
    svelteKitStartScript.exec(indexHtml);
  const inlineScript = content.replace(/^\s*/gm, "");

  writeFileSync(
    join(process.cwd(), "public", "main.js"),
    inlineScript,
    "utf-8"
  );

  // 2. replace SvelteKit script tag content with empty
  return indexHtml.replace(svelteKitStartScript, "$1$3");
};

/**
 * Inject "Content Security Policy" (CSP) into index.html for production build
 *
 * Note about the rules:
 *
 * - script-src 'unsafe-eval' is required because:
 * 1. agent-js uses a WebAssembly module for the validation of bls signatures.
 *    source: II https://github.com/dfinity/internet-identity/blob/c5709518ce3daaf7fdd9c7994120b66bd613f01b/src/internet_identity/src/main.rs#L824
 * 2. nns-js auto-generated proto js code (base_types_pb.js and ledger_pb.js) require 'unsafe-eval' as well
 *
 * - script-src and usage of 'integrity':
 * Ideally we would like to secure the scripts that are loaded with the 'integrity=sha256-...' hashes attributes - e.g. https://stackoverflow.com/a/68492689/5404186.
 * However, this is currently only supported by Chrome. Firefox issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1409200
 * To overcome this, we include within the index.html a first script which, when executed at app boot time, add a script that actually loads the main.js.
 * We generate the hash for that particular first script and set 'strict-dynamic' to trust those scripts that will be loaded per extension - the chunks used by the app.
 *
 * - script-src and 'strict-dynamic':
 * Chrome 40+ / Firefox 31+ / Safari 15.4+ / Edge 15+ supports 'strict-dynamic'.
 * Safari 15.4 has been released recently - March 15, 2022 - that's why we add 'unsafe-inline' and https: to the rules for backwards compatibility.
 * Browsers that supports the 'strict-dynamic' rule will ignore these backwards directives (CSP 3).
 *
 * - style-src 'unsafe-inline' is required because:
 * 1. svelte uses inline style for animation (scale, fly, fade, etc.)
 *    source: https://github.com/sveltejs/svelte/issues/6662
 */
const updateCSP = (indexHtml) => {
  const sw = /<script[\s\S]*?>([\s\S]*?)<\/script>/gm;

  const indexHashes = [];

  let m;
  while ((m = sw.exec(indexHtml))) {
    const content = m[1];

    indexHashes.push(
      `'sha256-${createHash("sha256").update(content).digest("base64")}'`
    );
  }

  const csp = `<meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none';
        connect-src 'self' ${cspConnectSrc()};
        img-src 'self' data: https://nns.raw.ic0.app/;
        child-src 'self';
        manifest-src 'self';
        script-src 'unsafe-eval' 'unsafe-inline' https: 'strict-dynamic' ${indexHashes.join(
          " "
        )};
        base-uri 'self';
        form-action 'none';
        style-src 'self' 'unsafe-inline';
        font-src 'self';
        upgrade-insecure-requests;"
    />`;

  return indexHtml.replace("<!-- CONTENT_SECURITY_POLICY -->", csp);
};

const cspConnectSrc = () => {
  const src = [
    process.env.VITE_IDENTITY_SERVICE_URL,
    process.env.VITE_OWN_CANISTER_URL,
    process.env.VITE_HOST,
    process.env.VITE_GOVERNANCE_CANISTER_URL,
    process.env.VITE_LEDGER_CANISTER_URL,
  ];

  return src
    .filter((url) => url !== undefined)
    .join(" ")
    .trim();
};

buildCsp();
