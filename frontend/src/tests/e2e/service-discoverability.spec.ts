import { step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test the service discoverability files", async ({ request }) => {
  await step("The manifest declares only the nns-dapp canister");
  const html = await (await request.get("/")).text();
  const ownCanisterId = html.match(/data-own-canister-id="([^"]+)"/)?.[1];
  expect(ownCanisterId).toBeTruthy();

  const manifest = await request.get("/.well-known/ic-architecture");
  expect(manifest.status()).toBe(200);
  expect(manifest.headers()["content-type"]).toBe("application/json");
  expect(manifest.headers()["access-control-allow-origin"]).toBe("*");
  expect(await manifest.json()).toEqual({
    version: "1.0.0",
    canisters: [
      expect.objectContaining({
        id: ownCanisterId,
        name: "nns-dapp",
      }),
    ],
  });

  // Only mainnet and beta set II_DERIVATION_ORIGIN. The gateway cannot verify
  // the certificate of a missing asset, so the status is 503 and not 404.
  await step("A local deployment serves no derivation origin");
  const derivationOrigin = await request.get(
    "/.well-known/ii-derivation-origin"
  );
  expect(derivationOrigin.ok()).toBe(false);
});
