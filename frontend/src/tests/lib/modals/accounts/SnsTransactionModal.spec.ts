import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
import { snsTransferTokens } from "$lib/services/sns-accounts.services";
import { authStore } from "$lib/stores/auth.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "$tests/mocks/sns-accounts.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { testTransferTokens } from "$tests/utils/transaction-modal.test.utils";
import type { Principal } from "@dfinity/principal";
import { waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { vi } from "vitest";

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    snsTransferTokens: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsTransactionModal", () => {
  const renderTransactionModal = (selectedAccount?: Account) =>
    renderModal({
      component: SnsTransactionModal,
      props: {
        selectedAccount,
      },
    });

  beforeAll(() =>
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe)
  );

  beforeEach(() => {
    vi.spyOn(snsAccountsStore, "subscribe").mockImplementation(
      mockSnsAccountsStoreSubscribe(mockPrincipal)
    );
    vi.spyOn(snsSelectedTransactionFeeStore, "subscribe").mockImplementation(
      mockSnsSelectedTransactionFeeStoreSubscribe()
    );
    vi.spyOn(selectedUniverseIdStore, "subscribe").mockImplementation(
      (run: Subscriber<Principal>): (() => void) => {
        run(mockPrincipal);
        return () => undefined;
      }
    );

    page.mock({ data: { universe: mockPrincipal.toText() } });
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
