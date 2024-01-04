import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
import { snsTransferTokens } from "$lib/services/sns-accounts.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { testTransferTokens } from "$tests/utils/transaction-modal.test-utils";
import { TokenAmountV2 } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    snsTransferTokens: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsTransactionModal", () => {
  const rootCanisterId = mockPrincipal;
  const token = { name: "Test", symbol: "TST", decimals: 8 };
  const transactionFee = TokenAmountV2.fromUlps({
    amount: 10_000n,
    token,
  });
  const renderTransactionModal = (selectedAccount?: Account) =>
    renderModal({
      component: SnsTransactionModal,
      props: {
        selectedAccount,
        rootCanisterId,
        transactionFee,
        token,
      },
    });

  beforeEach(() => {
    resetIdentity();
    snsAccountsStore.reset();
  });

  it("should transfer tokens", async () => {
    // Used to choose the source account
    snsAccountsStore.setAccounts({
      rootCanisterId,
      accounts: [mockSnsMainAccount],
      certified: true,
    });
    const result = await renderTransactionModal();

    await testTransferTokens({ result });

    await waitFor(() => expect(snsTransferTokens).toBeCalled());
  });

  it("should not render the select account dropdown if selected account is passed", async () => {
    const { queryByTestId } = await renderTransactionModal(mockSnsMainAccount);

    await waitFor(() =>
      expect(queryByTestId("transaction-step-1")).toBeInTheDocument()
    );
    expect(queryByTestId("select-account-dropdown")).not.toBeInTheDocument();
  });
});
