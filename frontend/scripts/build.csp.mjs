#!/usr/bin/env node

import { createHash } from "crypto";
import * as dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { findHtmlFiles } from "./build.utils.mjs";

dotenv.config();

const aggregatorCanisterUrl = process.env.VITE_AGGREGATOR_CANISTER_URL;
const isAggregatorCanisterUrlDefined = aggregatorCanisterUrl.length > 0;

const buildCsp = (htmlFile) => {
  // 1. We extract the start script parsed by SvelteKit into the html file
  const indexHTMLWithoutStartScript = extractStartScript(htmlFile);
  // 2. We add our custom script loader - we inject it at build time because it would throw an error when developing locally if missing
  const indexHTMLWithScriptLoader = injectScriptLoader(
    htmlFile,
    indexHTMLWithoutStartScript
  );
  // 3. Replace preloaders
  const indexHTMLWithPreloaders = injectLinkPreloader(
    indexHTMLWithScriptLoader
  );
  // 4. remove the content-security-policy tag injected by SvelteKit
  const indexHTMLNoCSP = removeDefaultCspTag(indexHTMLWithPreloaders);
  // 5. We calculate the sha256 values for these scripts and update the CSP
  const indexHTMLWithCSP = updateCSP(indexHTMLNoCSP);

  writeFileSync(htmlFile, indexHTMLWithCSP);
};

const removeDefaultCspTag = (indexHtml) => {
  return indexHtml.replace(
    '<meta http-equiv="content-security-policy" content="">',
    ""
  );
};

/**
 * We need a script loader to implement a proper Content Security Policy. See `updateCSP` doc for more information.
 */
const injectScriptLoader = (filePath, indexHtml) => {
  const buildDir = join(process.cwd(), "public");
  const folderPath = dirname(filePath.replace(buildDir, "")).split("/").pop();

  return indexHtml.replace(
    "<!-- SCRIPT_LOADER -->",
    `<script sveltekit-loader>
      const loader = document.createElement("script");
      loader.type = "module";
      loader.src = "${folderPath !== "" ? `/${folderPath}` : ""}/main.js";
      document.head.appendChild(loader);
    </script>`
  );
};

/**
 * Calculating the sh256 value for the preloaded link and whitelisting these seem not to be supported by the Content-Security-Policy.
 * Instead, we transform these in dynamic scripts and add the sha256 value of the script to the script-src policy of the CSP.
 */
const injectLinkPreloader = (indexHtml) => {
  const preload = /<link rel="preload"[\s\S]*?href="([\s\S]*?)">/gm;

  const links = [];

  let p;
  while ((p = preload.exec(indexHtml))) {
    const [linkTag, src] = p;

    links.push({
      linkTag,
      src,
    });
  }

  // 1. Inject pre-loaders dynamically after load
  const loader = `<script sveltekit-preloader>
      const links = [${links.map(({ src }) => `'${src}'`)}];
      for (const link of links) {
          const preloadLink = document.createElement("link");
          preloadLink.href = link;
          preloadLink.rel = "preload";
          preloadLink.as = "script";
          document.head.appendChild(loader);
      }
    </script>`;

  let updateIndex = indexHtml.replace("<!-- LINKS_PRELOADER -->", loader);

  // 2. Remove original <link rel="preload" as="script" />
  for (const url of links) {
    const { linkTag } = url;
    updateIndex = updateIndex.replace(linkTag, "");
  }

  return updateIndex;
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
const extractStartScript = (htmlFile) => {
  const indexHtml = readFileSync(htmlFile, "utf-8");

  const svelteKitStartScript = /(<script>)([\s\S]*?)(<\/script>)/gim;

  // 1. extract SvelteKit start script to a separate main.js file
  const [_script, _scriptStartTag, content, _scriptEndTag] =
    svelteKitStartScript.exec(indexHtml);
  const inlineScript = content.replace(/^\s*/gm, "");

  // Each file needs its own main.js because the script that calls the SvelteKit start function contains information dedicated to the route
  // i.e. the routeId and a particular id for the querySelector use to attach the content
  const folderPath = dirname(htmlFile);

  // 2. Extract the SvelteKit script into a separate file

  // We need to replace the document.currentScript.parentElement because the script is added to the head. SvelteKit except the <body /> element as initial parameter.
  // We also need to attach explicitly to the `window` the __sveltekit_ variables because they are not defined in the global scope but are used as global.
  const moduleScript = inlineScript
    .replaceAll(
      "document.currentScript.parentElement",
      "document.querySelector('body')"
    )
    .replaceAll(/__sveltekit_(.*)\s=/g, "window.$&");

  writeFileSync(join(folderPath, "main.js"), moduleScript, "utf-8");

  // 3. Replace original SvelteKit script tag content with empty
  return indexHtml.replace(svelteKitStartScript, "");
};

/**
 * Inject "Content Security Policy" (CSP) into index.html for production build
 *
 * Note about the rules:
 *
 * - script-src and usage of 'integrity':
 * Ideally we would like to secure the scripts that are loaded with the 'integrity=sha256-...' hashes attributes - e.g. https://stackoverflow.com/a/68492689/5404186.
 * However, this is currently only supported by Chrome. Firefox issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1409200
 * To overcome this, we include within the index.html a first script which, when executed at app boot time, add a script that actually loads the main.js.
 * We generate the hash for that particular first script and set 'strict-dynamic' to trust those scripts that will be loaded per extension - the chunks used by the app.
 *
 * - script-src and 'strict-dynamic':
 * Chrome 40+ / Firefox 31+ / Safari 15.4+ / Edge 15+ supports 'strict-dynamic'.
 * Safari 15.4 has been released recently - March 15, 2022 - that's why we add 'unsafe-inline' to the rules for backwards compatibility.
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
        img-src 'self' data: https://nns.internetcomputer.org/ https://nns.ic0.app/ https://nns.raw.ic0.app/ \${{SNS_AGGREGATOR_URL}};
        child-src 'self';
        manifest-src 'self';
        script-src 'unsafe-inline' 'strict-dynamic' ${indexHashes.join(" ")};
        base-uri 'self';
        form-action 'none';
        style-src 'self' 'unsafe-inline';
        font-src 'self';
        upgrade-insecure-requests;"
    />`;

  return indexHtml.replace("<!-- CONTENT_SECURITY_POLICY -->", csp);
};

const cspConnectSrc = () => {
  // TODO: Use `URL` to check if the URL is valid and not introduce a security issue
  const src = [
    "${{IDENTITY_SERVICE_URL}}",
    // We move to internetcomputer.org, but if a user access the app with the old URL, we need to allow it
    "https://identity.ic0.app",
    // We still allow users to access the app with the old URL
    "https://nns.ic0.app",
    // Location services
    "https://api.iplocation.net",
    "https://api.ip.sb",
    "'self'",
    "${{HOST}}",
    "${{SNS_AGGREGATOR_URL}}",
    "${{ICP_SWAP_URL}}",
    // TODO: solve with a worker
    // Used for the metrics of OC launch
    "https://2hx64-daaaa-aaaaq-aaana-cai.raw.icp0.io",
    // Used for the metrics of Sonic launch.
    "https://7hi6i-7iaaa-aaaaq-aaaqq-cai.raw.icp0.io",
    // Used for the metrics of Kinic launch.
    "https://7sppf-6aaaa-aaaaq-aaata-cai.raw.icp0.io",
    // Used for the metrics of SNS1(Dragginz) launch.
    "https://zcdfx-6iaaa-aaaaq-aaagq-cai.raw.icp0.io",
    // Used for anonymous user metrics
    "https://plausible.io/api/event",
  ];

  if (isAggregatorCanisterUrlDefined) {
    src.push(aggregatorCanisterUrl);
  }

  return src
    .filter((url) => url !== undefined)
    .join(" ")
    .trim();
};

const htmlFiles = findHtmlFiles();
htmlFiles.forEach((htmlFile) => buildCsp(htmlFile));
