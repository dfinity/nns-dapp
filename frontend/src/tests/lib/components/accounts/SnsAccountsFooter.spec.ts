import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { page } from "$mocks/$app/stores";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  modalToolbarSelector,
  waitModalIntroEnd,
} from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { testAccountsModal } from "$tests/utils/accounts.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { testTransferTokens } from "$tests/utils/transaction-modal.test-utils";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/api/sns-ledger.api");

describe("SnsAccountsFooter", () => {
  const rootCanisterId = rootCanisterIdMock;
  const rootCanisterIdText = rootCanisterId.toText();
  const fee = 10_000n;

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();

    vi.spyOn(snsLedgerApi, "transactionFee").mockResolvedValue(fee);
    vi.spyOn(snsLedgerApi, "getSnsToken").mockResolvedValue(mockSnsToken);
    vi.spyOn(snsLedgerApi, "getSnsAccounts").mockResolvedValue([
      mockSnsMainAccount,
    ]);

    snsAccountsStore.reset();
    transactionsFeesStore.reset();
    setSnsProjects([
      {
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
    transactionsFeesStore.setFee({
      rootCanisterId,
      fee,
      certified: true,
    });

    snsAccountsStore.setAccounts({
      rootCanisterId,
      accounts: [mockSnsMainAccount],
      certified: true,
    });

    page.mock({ data: { universe: rootCanisterIdText } });
  });

  const modalProps = {
    testComponent: SnsAccountsFooter,
  };

  it("should open receive modal", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testAccountsModal({ result, testId: "receive-sns" });

    const { getByTestId } = result;

    await waitFor(() => expect(getByTestId("receive-modal")).not.toBeNull());
  });

  it("should sync accounts after finish receiving tokens", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testAccountsModal({ result, testId: "receive-sns" });

    const { getByTestId, container } = result;

    await waitModalIntroEnd({ container, selector: modalToolbarSelector });

    await waitFor(() => expect(getByTestId("receive-modal")).not.toBeNull());

    expect(snsLedgerApi.getSnsAccounts).toBeCalledTimes(0);

    fireEvent.click(getByTestId("reload-receive-account") as HTMLButtonElement);

    // Query + Update calls
    await waitFor(() => expect(snsLedgerApi.getSnsAccounts).toBeCalledTimes(2));
  });

  it("should make sns transaction", async () => {
    const result = render(AccountsTest, { props: modalProps });

    const { getByTestId, queryByTestId } = result;

    await waitFor(() =>
      expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
    );

    await testAccountsModal({ result, testId: "open-new-sns-transaction" });

    expect(getByTestId("transaction-step-1")).toBeInTheDocument();

    expect(snsLedgerApi.snsTransfer).toHaveBeenCalledTimes(0);

    const destinationAccount = {
      owner: principal(1),
    };
    await testTransferTokens({
      result,
      amount: "2",
      destinationAddress: encodeIcrcAccount(destinationAccount),
    });

    await runResolvedPromises();

    expect(snsLedgerApi.snsTransfer).toHaveBeenCalledTimes(1);
    expect(snsLedgerApi.snsTransfer).toHaveBeenCalledWith({
      identity: mockIdentity,
      rootCanisterId,
      amount: 200000000n,
      fromSubaccount: undefined,
      fee,
      to: destinationAccount,
    });
  });
});
