#!/usr/bin/env node

import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { envConfig } from "../env.config.mjs";

/**
 * Rollup takes care of the JS and CSS bundles. Here we copy the index.html from the source to the output folder.
 * At the same time, we also update the <base /> reference (see comment below).
 * By pre-rendering this information, we make it static and guarantee it will be set when the app - the JS code - accesses it at runtime.
 */
const buildIndex = () => {
  const buffer = readFileSync("./src/index.html");
  const content = buffer.toString("utf-8");

  let updatedContent = updateBaseHref(content);
  updatedContent = updateCSP(updatedContent);

  writeFileSync("./public/index.html", updatedContent);
};

/**
 * Specifies where the svelte app is loaded (typically "/" in both local development and in production)
 */
const updateBaseHref = (content) =>
  content.replace(
    "<!-- BASE_HREF -->",
    `<base href="${process.env.BASE_HREF || "/"}" />`
  );

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
 * - style-src 'unsafe-inline' is required because:
 * 1. svelte uses inline style for animation (scale, fly, fade, etc.)
 *    source: https://github.com/sveltejs/svelte/issues/6662
 */
const updateCSP = (content) => {
  // In local development mode, no CSP rule
  if (envConfig.ENVIRONMENT === "local") {
    return content.replace("<!-- CONTENT_SECURITY_POLICY -->", "");
  }

  const indexHtml = readFileSync(
    join(process.cwd(), "src", "index.html"),
    "utf-8"
  );
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
        script-src 'unsafe-eval' 'strict-dynamic' ${indexHashes.join(" ")};
        base-uri 'self';
        form-action 'none';
        style-src 'self' 'unsafe-inline';
        font-src 'self';
        upgrade-insecure-requests;"
    />`;

  return content.replace("<!-- CONTENT_SECURITY_POLICY -->", csp);
};

const cspConnectSrc = () => {
  const {
    IDENTITY_SERVICE_URL,
    OWN_CANISTER_URL,
    HOST,
    GOVERNANCE_CANISTER_URL,
    LEDGER_CANISTER_URL,
    MAINNET,
  } = envConfig;

  const src = [
    IDENTITY_SERVICE_URL,
    OWN_CANISTER_URL,
    HOST,
    GOVERNANCE_CANISTER_URL,
    LEDGER_CANISTER_URL,
    MAINNET,
  ];

  return src
    .filter((url) => url !== undefined)
    .join(" ")
    .trim();
};

buildIndex();
