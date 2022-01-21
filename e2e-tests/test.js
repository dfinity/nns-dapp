#!/usr/bin/env node
/* TODO: document */

"use strict";

const fs = require("fs");

const CANISTER_IDS_PATH = `${__dirname}/../.dfx/local/canister_ids.json`;
let canister_id;
try {
  const canister_ids = JSON.parse(fs.readFileSync(CANISTER_IDS_PATH, "utf8"));
  canister_id = canister_ids["nns-dapp"].local;
} catch (e) {
  console.log(
    `Could not read 'nns-dapp' local canister ID from ${CANISTER_IDS_PATH}`
  );
  throw e;
}

console.log(`Using canister ID: ${canister_id}`);

const DFX_JSON_PATH = `${__dirname}/../dfx.json`;
let replica_host;
try {
  const dfx_json = JSON.parse(fs.readFileSync(DFX_JSON_PATH, "utf8"));
  replica_host = dfx_json.networks.local.bind;
  if (!replica_host.startsWith("http://")) {
    replica_host = `http://${replica_host}`;
  }
} catch (e) {
  console.log(`Could not read replica host from ${DFX_JSON_PATH}`);
  throw e;
}

console.log(`Using replica host: ${replica_host}`);

// Any port would do here, it just needs to be the same the test runner uses,
// hence we set it as the `NNS_BASE_URL` environment variable.
const NNS_DAPP_PORT = 8086;
const NNS_DAPP_URL = `http://localhost:${NNS_DAPP_PORT}`;

const child_process = require("child_process");

const proxy = child_process.spawn("proxy", [
  "--replica-host",
  replica_host,
  `${canister_id}:${NNS_DAPP_PORT}`,
]);

proxy.stdout.on("data", (data) => {
  console.log(`proxy: ${data}`);
});

proxy.stdout.on("close", (code) => {
  console.log(`proxy returned with ${code}`);
});

const wdio = child_process.spawn("npm", ["run", "wdio"], {
  env: { ...process.env, NNS_DAPP_URL: NNS_DAPP_URL },
});

wdio.stdout.on("data", (data) => {
  console.log(`wdio: ${data}`);
});

wdio.stdout.on("close", (code) => {
  console.log(`wdio returned with ${code}`);
  proxy.kill();
});
