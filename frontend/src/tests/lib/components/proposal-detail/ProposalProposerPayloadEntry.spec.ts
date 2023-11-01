import ProposalProposerPayloadEntry from "$lib/components/proposal-detail/ProposalProposerPayloadEntry.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { simplifyJson } from "$tests/utils/json.test-utils";
import { render, waitFor } from "@testing-library/svelte";
import { beforeEach } from "vitest";

describe("ProposalProposerPayloadEntry", () => {
  // TODO(GIX-2030) remove this once the feature flag is removed
  beforeEach(() =>
    overrideFeatureFlagsStore.setFlag("ENABLE_FULL_WIDTH_PROPOSAL", false)
  );

  const nestedObj = { b: "c" };
  const payloadWithJsonString = {
    a: JSON.stringify(nestedObj),
  };

  it("should parse JSON strings and render them", async () => {
    const { queryByTestId } = render(ProposalProposerPayloadEntry, {
      props: {
        payload: payloadWithJsonString,
      },
    });

    const jsonElement = queryByTestId("json-wrapper");
    await waitFor(() =>
      expect(simplifyJson(jsonElement.textContent)).toBe(
        simplifyJson(JSON.stringify(payloadWithJsonString))
      )
    );
  });
});
