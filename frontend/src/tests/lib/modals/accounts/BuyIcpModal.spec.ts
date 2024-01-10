import BuyIcpModal from "$lib/modals/accounts/BuyIcpModal.svelte";
import type { Account } from "$lib/types/account";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { BuyICPModalPo } from "$tests/page-objects/BuyICPModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("BuyIcpModal", () => {
  const identifier =
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f";
  const account = {
    ...mockMainAccount,
    identifier,
  };

  const renderModal = (account: Account = mockMainAccount) => {
    const { container } = render(BuyIcpModal, { props: { account } });

    return BuyICPModalPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the account's identifier", async () => {
    const po = renderModal(account);

    expect(await po.getAccountIdentifier()).toEqual(identifier);
  });

  it("renders an anchor tag with URL to banxa with account identifier", async () => {
    const po = renderModal();

    expect(await po.getBanxaUrl()).toEqual(
      `https://checkout.banxa.com/?fiatAmount=100&fiatType=USD&coinAmount=0.00244394&coinType=ICP&lockFiat=true&blockchain=BTC&orderMode=BUY&backgroundColor=2a1a47&primaryColor=9b6ef7&secondaryColor=8b55f6&textColor=ffffff&walletAddress=${identifier}`
    );
  });
});
