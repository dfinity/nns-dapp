import LinkToDashboardCanister from "$lib/components/tokens/LinkToDashboardCanister.svelte";
import { LinkToDashboardCanisterPo } from "$tests/page-objects/LinkToDashboardCanister.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";

describe("LinkToDashboardCanister", () => {
  const canisterIdText = "aaaaa-aa";
  const urlToDashboard =
    "https://dashboard.internetcomputer.org/canister/aaaaa-aa";
  const canisterId = Principal.fromText(canisterIdText);

  const renderComponent = (props) => {
    const { container } = render(LinkToDashboardCanister, { props });
    return LinkToDashboardCanisterPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render label", async () => {
    const po = renderComponent({
      canisterId,
    });
    expect(await po.getLabel().isPresent()).toEqual(true);
    expect(await po.getLabelText()).toBe("View in Dashboard");
  });

  it("should render href", async () => {
    const po = renderComponent({ canisterId });
    expect(await po.getHref()).toBe(urlToDashboard);
  });
});
