#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
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
 * - style-src 'unsafe-inline' is required because:
 * 1. svelte uses inline style for animation (scale, fly, fade, etc.)
 *    source: https://github.com/sveltejs/svelte/issues/6662
 */
const updateCSP = (content) => {
  // In local development mode, no CSP rule
  if (envConfig.ENVIRONMENT === "local") {
    return content.replace("<!-- CONTENT_SECURITY_POLICY -->", "");
  }

  const csp = `<meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none';
        connect-src 'self' ${cspConnectSrc()};
        img-src 'self' https://nns.raw.ic0.app/;
        child-src 'self';
        manifest-src 'self';
        script-src 'unsafe-eval' 'strict-dynamic' 'nonce-main-31858fd0-b02b-4e0b-bf0b-c49e9b515a25' 'nonce-main-bc619616-7c54-4009-abff-493dd9b42bac';
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
