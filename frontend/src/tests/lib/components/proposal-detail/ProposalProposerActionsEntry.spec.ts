import ProposalProposerActionsEntry from "$lib/components/proposal-detail/ProposalProposerActionsEntry.svelte";
import { ProposalProposerActionsEntryPo } from "$tests/page-objects/ProposalProposerActionsEntry.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
import { render } from "@testing-library/svelte";

describe("ProposalProposerActionsEntry", () => {
  const renderComponent = (props) => {
    const { container } = render(ProposalProposerActionsEntry, {
      props,
    });

    return ProposalProposerActionsEntryPo.under(
      new VitestPageObjectElement(container)
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

  it("should render action fields", async () => {
    const key = "keyTest";
    const value = "valueTest";
    const po = renderComponent({
      actionKey: "testKey",
      actionData: { [key]: value },
    });

    expect((await po.getFieldsText()).replaceAll(" ", "")).toBe(
      '{keyTest:"valueTest"}'
    );
  });

  it("should render object fields as JSON", async () => {
    const key = "key";
    const value = { key: "value" };
    const key2 = "key2";
    const value2 = { key2: "value2" };
    const po = renderComponent({
      actionKey: "actionKey",
      actionData: {
        [key]: value,
        [key2]: value2,
      },
    });

    const jsonPos = await po.getJsonPos();
    expect(jsonPos.length).toBe(1);
    expect((await jsonPos[0].getText()).replaceAll(" ", "")).toEqual(
      '{key:{key:"value"}key2:{key2:"value2"}}'
    );
  });

  it("should render undefined fields as 'undefined' text'", async () => {
    const key = "key";
    const value = { key: "value", anotherKey: undefined };

    const po = renderComponent({
      actionKey: "actionKey",
      actionData: { [key]: value },
    });

    expect((await po.getFieldsText()).replaceAll(" ", "")).toBe(
      '{key:{key:"value"anotherKey:undefined}}'
    );
  });
});
