import ProposalProposerPayloadEntry from "$lib/components/proposal-detail/ProposalProposerPayloadEntry.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { JsonRepresentationModeTogglePo } from "$tests/page-objects/JsonRepresentationModeToggle.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { simplifyJson } from "$tests/utils/json.test-utils";
import { expect } from "@playwright/test";
import { render, waitFor } from "@testing-library/svelte";
import { beforeEach } from "vitest";

describe("ProposalProposerPayloadEntry", () => {
  const nestedObj = { b: "c" };

  beforeEach(() => {
    jsonRepresentationStore.setMode("raw");
  });

  it("should parse JSON strings and render them", async () => {
    const { queryByTestId } = render(ProposalProposerPayloadEntry, {
      props: {
        payload: JSON.stringify(nestedObj),
      },
    });

    const jsonElement = queryByTestId("json-preview-component");
    await waitFor(() =>
      expect(simplifyJson(jsonElement.textContent)).toBe(
        simplifyJson(JSON.stringify("{b:c}"))
      )
    );
  });

  it("should render json mode toggle", async () => {
    const { container } = render(ProposalProposerPayloadEntry, {
      props: {
        payload: JSON.stringify(nestedObj),
      },
    });

    expect(
      await JsonRepresentationModeTogglePo.under(
        new JestPageObjectElement(container)
      ).isPresent()
    ).toBe(true);
  });
});
