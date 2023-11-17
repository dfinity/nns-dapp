import WalletPageHeader from "$lib/components/accounts/WalletPageHeader.svelte";
import type { Universe } from "$lib/types/universe";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockUniverse } from "$tests/mocks/sns-projects.mock";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("WalletPageHeading", () => {
  const renderComponent = ({
    walletAddress = mockMainAccount.identifier,
    universe = mockUniverse,
  }: {
    walletAddress?: string;
    universe?: Universe;
  }) => {
    const { container } = render(WalletPageHeader, {
      props: {
        walletAddress,
        universe,
      },
    });
    return WalletPageHeaderPo.under(new JestPageObjectElement(container));
  };

  it("should render account identifier", async () => {
    const po = renderComponent({
      walletAddress:
        "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
    });

    expect(await po.getWalletAddress()).toBe(
      "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f"
    );
  });

  it("should render universe name", async () => {
    const universeName = "Test universe";
    const universe: Universe = {
      ...mockUniverse,
      title: universeName,
    };
    const po = renderComponent({ universe });

    expect(await po.getUniverse()).toBe(universeName);
  });
});
