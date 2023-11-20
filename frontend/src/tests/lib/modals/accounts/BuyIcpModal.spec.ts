import BuyIcpModal from "$lib/modals/accounts/BuyIcpModal.svelte";
import type { Account } from "$lib/types/account";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { BuyICPModalPo } from "$tests/page-objects/BuyICPModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("BuyIcpModal", () => {
  const renderModal = (account: Account = mockMainAccount) => {
    const { container } = render(BuyIcpModal, { props: { account } });

    return BuyICPModalPo.under(new JestPageObjectElement(container));
  };

  const openSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).open = openSpy;
  });

  it("renders the account's identifier", async () => {
    const account = {
      ...mockMainAccount,
      identifier:
        "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
    };
    const po = renderModal(account);

    expect(await po.getAccountIdentifier()).toEqual(account.identifier);
  });

  it("opens a new window with Banxa URL", async () => {
    const po = renderModal();

    expect(openSpy).not.toHaveBeenCalled();

    await po.clickBanxa();

    // TODO: Change with actual URL
    expect(openSpy).toHaveBeenCalledWith(
      "https://banxa.com/",
      "_blank",
      "width=400,height=600"
    );
  });
});
