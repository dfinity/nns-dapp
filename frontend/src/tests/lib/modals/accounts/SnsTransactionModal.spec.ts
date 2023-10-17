import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
import { snsTransferTokens } from "$lib/services/sns-accounts.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "$tests/mocks/sns-accounts.mock";
import { testTransferTokens } from "$tests/utils/transaction-modal.test-utils";
import { TokenAmount } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    snsTransferTokens: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsTransactionModal", () => {
  const rootCanisterId = mockPrincipal;
  const token = { name: "Test", symbol: "TST" };
  const transactionFee = TokenAmount.fromE8s({
    amount: BigInt(10_000),
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
    vi.spyOn(snsAccountsStore, "subscribe").mockImplementation(
      mockSnsAccountsStoreSubscribe(rootCanisterId)
    );
  });

  it("should transfer tokens", async () => {
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
