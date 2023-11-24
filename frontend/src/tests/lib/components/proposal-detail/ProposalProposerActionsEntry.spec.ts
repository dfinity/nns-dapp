import ProposalProposerActionsEntry from "$lib/components/proposal-detail/ProposalProposerActionsEntry.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { ProposalProposerActionsEntryPo } from "$tests/page-objects/ProposalProposerActionsEntry.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { beforeEach } from "vitest";

describe("ProposalProposerActionsEntry", () => {
  const renderComponent = (props) => {
    const { container } = render(ProposalProposerActionsEntry, {
      props,
    });

    return ProposalProposerActionsEntryPo.under(
      new JestPageObjectElement(container)
    );
  };

  // switch to raw mode to simplify data validation
  beforeEach(() => jsonRepresentationStore.setMode("raw"));

  it("should render action key as title", async () => {
    const actionKey = "testKey";
    const po = renderComponent({
      actionKey,
      actionData: {},
    });

    expect(await po.getActionTitle()).toBe(actionKey);
  });

  it("should render data", async () => {
    const key = "keyTest";
    const value = "valueTest";
    const po = renderComponent({
      actionKey: "testKey",
      actionData: { [key]: value },
    });

    expect(JSON.parse(await po.getJsonPreviewPo().getRawText())).toEqual({
      keyTest: "valueTest",
    });
  });

  it("should render preview mode toggle", async () => {
    const po = renderComponent({
      actionKey: "actionKey",
      actionData: {},
    });

    expect(await po.getJsonRepresentationModeTogglePo().isPresent()).toBe(true);
  });

  it("should render fields with undefined value", async () => {
    const key = "key";
    const value = { key: "value", anotherKey: undefined };

    const po = renderComponent({
      actionKey: "actionKey",
      actionData: { [key]: value },
    });

    expect(JSON.parse(await po.getJsonPreviewPo().getRawText())).toEqual({
      key: { key: "value", anotherKey: undefined },
    });
  });
});
