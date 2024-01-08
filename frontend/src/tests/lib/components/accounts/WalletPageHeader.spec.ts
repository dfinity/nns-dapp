import WalletPageHeader from "$lib/components/accounts/WalletPageHeader.svelte";
import type { Universe } from "$lib/types/universe";
import { mockUniverse } from "$tests/mocks/sns-projects.mock";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("WalletPageHeading", () => {
  const universeName = "Test universe";
  const universe: Universe = {
    ...mockUniverse,
    title: universeName,
  };
  const walletAddress =
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f";

  const renderComponent = ({
    walletAddress,
    universe,
  }: {
    walletAddress: string;
    universe: Universe;
  }) => {
    const { container } = render(WalletPageHeader, {
      props: {
        walletAddress,
        universe,
      },
    });
    return WalletPageHeaderPo.under(new JestPageObjectElement(container));
  };

  it("should render universe name and account identifier", async () => {
    const po = renderComponent({
      universe,
      walletAddress,
    });

    expect(await po.getUniverse()).toBe(universeName);
    expect(await po.getWalletAddress()).toBe(walletAddress);
  });

  it("should render universe name and no account identifier", async () => {
    const po = renderComponent({
      universe,
      walletAddress: undefined,
    });

    expect(await po.getUniverse()).toBe(universeName);
    expect(await po.getHashPo().isPresent()).toBe(false);
  });
});
