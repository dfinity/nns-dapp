import ProposalProposerActionsEntry from "$lib/components/proposal-detail/ProposalProposerActionsEntry.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { ProposalProposerActionsEntryPo } from "$tests/page-objects/ProposalProposerActionsEntry.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ProposalProposerActionsEntry", () => {
  const renderComponent = (props) => {
    const { container } = render(ProposalProposerActionsEntry, {
      props,
    });

    return ProposalProposerActionsEntryPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render action key as title", async () => {
    const actionKey = "testKey";
    const po = renderComponent({
      actionKey,
      actionData: {},
    });

    expect(await po.getActionTitle()).toBe(actionKey);
  });

  it("should render proposal actionData as json", async () => {
    const key = "keyTest";
    const value = "valueTest";
    jsonRepresentationStore.setMode("raw");
    const po = renderComponent({
      actionKey: "testKey",
      actionData: { [key]: value },
    });

    expect(await po.getJsonPreviewPo().getRawObject()).toEqual({
      keyTest: "valueTest",
    });
  });

  it("should copy a string that reads __UNDEFINED__ as that string", async () => {
    Object.assign(window.navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    const po = renderComponent({
      actionKey: "testKey",
      actionData: { test: "__UNDEFINED__" },
    });

    await po.getCopyButtonPo().click();

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      `{\n  "test": "__UNDEFINED__"\n}`
    );
  });

  it("should render preview mode toggle", async () => {
    const po = renderComponent({
      actionKey: "actionKey",
      actionData: {},
    });

    expect(await po.getJsonRepresentationModeTogglePo().isPresent()).toBe(true);
  });
});
