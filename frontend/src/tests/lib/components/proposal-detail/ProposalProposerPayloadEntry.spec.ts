/**
 * @jest-environment jsdom
 */
import ProposalProposerPayloadEntry from "$lib/components/proposal-detail/ProposalProposerPayloadEntry.svelte";
import { simplifyJson } from "$tests/utils/json.test-utils";
import { render, waitFor } from "@testing-library/svelte";

describe("ProposalProposerPayloadEntry", () => {
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
