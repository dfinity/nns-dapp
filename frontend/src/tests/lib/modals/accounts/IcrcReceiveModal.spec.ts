import IcrcReceiveModal from "$lib/modals/accounts/IcrcReceiveModal.svelte";
import type { Account } from "$lib/types/account";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";

describe("IcrcReceiveModal", () => {
  const reloadSpy = vi.fn();
  const tokenSymbol = "TST";

  const renderComponent = async ({
    account = mockSnsMainAccount,
    tokenSymbol,
  }: {
    account?: Account;
    tokenSymbol: string;
  }) => {
    const { container } = await renderModal({
      component: IcrcReceiveModal,
      props: {
        data: {
          account,
          reload: reloadSpy,
          canSelectAccount: false,
          universeId: rootCanisterIdMock,
          tokenSymbol,
          logo: "logo.svg",
        },
      },
    });
    return ReceiveModalPo.under(new JestPageObjectElement(container));
  };

  it("should render the sns logo", async () => {
    const po = await renderComponent({ tokenSymbol });

    expect(await po.getLogoAltText()).toBe(tokenSymbol);
  });

  it("should render the address label of the sns account", async () => {
    const po = await renderComponent({
      tokenSymbol,
      account: mockSnsMainAccount,
    });

    expect(await po.getTokenAddressLabel()).toBe(`${tokenSymbol} Address`);
    expect(await po.getAddress()).toBe(mockSnsMainAccount.identifier);
  });
});
