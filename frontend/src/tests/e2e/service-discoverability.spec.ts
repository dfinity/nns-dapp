import { step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

// Only mainnet sets II_DERIVATION_ORIGIN, which turns the files on. The gateway
// cannot verify the certificate of a missing asset, so the status is 503 and
// not 404.
test("Test that a local deployment is not discoverable", async ({
  request,
}) => {
  await step("A local deployment serves no manifest");
  const manifest = await request.get("/.well-known/ic-architecture");
  expect(manifest.ok()).toBe(false);

  await step("A local deployment serves no derivation origin");
  const derivationOrigin = await request.get(
    "/.well-known/ii-derivation-origin"
  );
  expect(derivationOrigin.ok()).toBe(false);
});
