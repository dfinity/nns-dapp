import ImportTokenCanisterId from "$lib/components/accounts/ImportTokenCanisterId.svelte";
import { ImportTokenCanisterIdPo } from "$tests/page-objects/ImportTokenCanisterId.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ImportTokenCanisterId", () => {
  const props = {
    label: "test label",
    canisterId: "aaaaa-aa",
    canisterLinkHref: "http://test.com",
    canisterIdFallback: "test fallback",
  };
  const renderComponent = (props) => {
    const { container } = render(ImportTokenCanisterId, {
      props,
    });
    return ImportTokenCanisterIdPo.under(new JestPageObjectElement(container));
  };

  it("should render label, canister id and buttons", async () => {
    const po = renderComponent(props);

    expect(await po.getLabel().isPresent()).toEqual(true);
    expect(await po.getLabelText()).toEqual("test label");
    expect(await po.getCanisterId().isPresent()).toEqual(true);
    expect(await po.getCanisterIdText()).toEqual("aaaaa-aa");
    expect(await po.getCopyButtonPo().isPresent()).toEqual(true);
    expect(await po.getLinkIconPo().isPresent()).toEqual(true);
  });

  it("should render buttons", async () => {
    const po = renderComponent(props);

    expect(await po.getCopyButtonPo().isPresent()).toEqual(true);
    expect(await po.getLinkIconPo().isPresent()).toEqual(true);
    expect(await po.getLinkIconPo().getHref()).toEqual("http://test.com");
  });

  it("should not render a fallback when canister id provided", async () => {
    const po = renderComponent(props);

    expect(await po.getCanisterId().isPresent()).toEqual(true);
    expect(await po.getCanisterIdFallback().isPresent()).toEqual(false);
  });

  it("should render fallback when canister id not provided", async () => {
    const po = renderComponent({
      label: "test label",
      canisterLinkHref: "http://test.com",
      canisterIdFallback: "test fallback",
    });

    expect(await po.getLabel().isPresent()).toEqual(true);
    expect(await po.getLabelText()).toEqual("test label");
    expect(await po.getCanisterIdFallback().isPresent()).toEqual(true);
    expect(await po.getCanisterIdFallbackText()).toEqual("test fallback");

    expect(await po.getCanisterId().isPresent()).toEqual(false);
  });

  it("should render no buttons when canister id not provided", async () => {
    const po = renderComponent({
      label: "test label",
      canisterLinkHref: "http://test.com",
      canisterIdFallback: "test fallback",
    });

    expect(await po.getCopyButtonPo().isPresent()).toEqual(false);
    expect(await po.getLinkIconPo().isPresent()).toEqual(false);
  });

  it("Should render neither the canister id nor the fallback when both parameters are not provided", async () => {
    const po = renderComponent({
      label: "test label",
    });

    expect(await po.getLabel().isPresent()).toEqual(true);
    expect(await po.getCanisterId().isPresent()).toEqual(false);
    expect(await po.getCanisterIdFallback().isPresent()).toEqual(false);
  });
});
