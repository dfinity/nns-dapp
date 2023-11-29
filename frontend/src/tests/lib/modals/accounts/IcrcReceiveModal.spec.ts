import IcrcReceiveModal from "$lib/modals/accounts/IcrcReceiveModal.svelte";
import type { Account } from "$lib/types/account";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";

describe("IcrcReceiveModal", () => {
  const reloadSpy = vi.fn();
  const tokenSymbol = "TST";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderReceiveModal = ({
    account = mockSnsMainAccount,
    tokenSymbol,
  }: {
    account?: Account;
    tokenSymbol: string;
  }) =>
    renderModal({
      component: IcrcReceiveModal,
      props: {
        data: {
          account,
          reload: reloadSpy,
          canSelectAccount: false,
        },
        universeId: rootCanisterIdMock,
        tokenSymbol,
        logo: "logo.svg",
      },
    });

  it("should render the sns logo", async () => {
    const { getByTestId } = await renderReceiveModal({
      tokenSymbol,
    });

    expect(getByTestId("logo").getAttribute("alt")).toEqual(tokenSymbol);
  });

  it("should render the address label of the sns account", async () => {
    const { queryByTestId } = await renderReceiveModal({
      tokenSymbol,
      account: mockSnsMainAccount,
    });

    expect(queryByTestId("qr-address-label").textContent.trim()).toBe(
      `${tokenSymbol} Address ${mockSnsMainAccount.identifier}`
    );
  });
});
