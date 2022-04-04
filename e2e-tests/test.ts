#!/usr/bin/env node
/* This starts the proxy and the test suite. The proxy configuration is read
 * from dfx.json and canister_ids.json. The proxy is shutdown after the tests
 * are run.
 */

"use strict";

const fs = require("fs");
const child_process = require("child_process");

/*
 * Read the values from dfx.json and canister_ids.json
 */
const CANISTER_IDS_PATH = `${__dirname}/../.dfx/local/canister_ids.json`;
let nns_canister_id;
let ii_canister_id;
try {
  const canister_ids = JSON.parse(fs.readFileSync(CANISTER_IDS_PATH, "utf8"));
  nns_canister_id = canister_ids["nns-dapp"].local;
  ii_canister_id = canister_ids["internet_identity"].local;
} catch (e) {
  console.log(
    `Could not read 'nns-dapp' local canister ID from ${CANISTER_IDS_PATH}`
  );
  throw e;
}

console.log(`NNS Dapp using canister ID: ${nns_canister_id}`);
console.log(`II using canister id: ${ii_canister_id}`);

const DFX_JSON_PATH = `${__dirname}/../dfx.json`;
let replica_host;
try {
  const dfx_json = JSON.parse(fs.readFileSync(DFX_JSON_PATH, "utf8"));
  replica_host = dfx_json.networks.local.bind;
  if (replica_host.match(/^https?:\/\//) === null) {
    replica_host = `http://${replica_host}`;
  }
} catch (e) {
  console.log(`Could not read replica host from ${DFX_JSON_PATH}`);
  throw e;
}

console.log(`Using replica host: ${replica_host}`);

/*
 * Start the proxy
 *
 * Any port would do here, it just needs to be the same the test runner uses,
 * hence we set it as the `NNS_DAPP_URL` environment variable which is read by
 * wdio.conf.js..
 */
const II_PORT = 8087;
const II_URL = `http://localhost:${II_PORT}`;
const NNS_DAPP_PORT = 8086;
const NNS_DAPP_URL = `http://localhost:${NNS_DAPP_PORT}`;

const proxy = child_process.spawn("proxy", [
  "--replica-host",
  replica_host,
  `${nns_canister_id}:${NNS_DAPP_PORT}`,
  `${ii_canister_id}:${II_PORT}`,
]);

proxy.stdout.on("data", (data) => {
  console.log(`proxy: ${data}`);
});

proxy.stdout.on("close", (code) => {
  console.log(`proxy returned with ${code}`);
});

/*
 * Start the tests
 */
const wdio = child_process.spawn("npm", ["run", "wdio"], {
  env: { ...process.env, NNS_DAPP_URL, II_URL },
});

wdio.stdout.on("data", (data) => {
  console.log(`wdio: ${data}`);
});

wdio.stderr.on("data", (data) => {
  console.log(`wdio error: ${data}`);
});

wdio.stdout.on("close", (code) => {
  console.log(`wdio returned with ${code}`);
  proxy.kill();
});

wdio.on("exit", (code: number, signal?: number) => {
  console.log("EXITING", code, signal);
  if (code > 0) {
    // bubble up error from wdio tests
    throw new Error(`End-to-end tests returned with ${code}`);
  } else if (undefined !== signal) {
    console.error("Child was killed with signal", signal);
  } else {
    console.log("Child exited okay");
  }
});
