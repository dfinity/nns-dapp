/**
 * @jest-environment jsdom
 */

import type { Transaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import NnsTransactionCard from "$lib/components/accounts/NnsTransactionCard.svelte";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import { formatToken } from "$lib/utils/token.utils";
import { mapNnsTransaction } from "$lib/utils/transactions.utils";
import en from "$tests/mocks/i18n.mock";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  mockReceivedFromMainAccountTransaction,
  mockSentToSubAccountTransaction,
} from "$tests/mocks/transaction.mock";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import { ICPToken } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("NnsTransactionCard", () => {
  const renderTransactionCard = (
    account = mockMainAccount,
    transaction = mockReceivedFromMainAccountTransaction
  ) =>
    render(NnsTransactionCard, {
      props: {
        account,
        transaction,
      },
    });

  it("renders received headline", () => {
    const { getByText } = renderTransactionCard(
      mockSubAccount,
      mockReceivedFromMainAccountTransaction
    );

    const expectedText = replacePlaceholders(en.transaction_names.receive, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders participate in swap transaction type", () => {
    const swapCanisterId = principal(0);
    const aggregatorData = {
      ...aggregatorSnsMockDto,
      canister_ids: {
        ...aggregatorSnsMockDto.canister_ids,
        swap_canister_id: swapCanisterId.toText(),
      },
    };
    snsAggregatorStore.setData([aggregatorData]);
    const swapCanisterAccount = getSwapCanisterAccount({
      controller: mockMainAccount.principal,
      swapCanisterId,
    });
    const swapTransaction: Transaction = {
      ...mockReceivedFromMainAccountTransaction,
      transfer: {
        Send: {
          fee: { e8s: BigInt(10000) },
          amount: { e8s: BigInt(110000000) },
          to: swapCanisterAccount.toHex(),
        },
      },
    };
    const { queryByTestId } = renderTransactionCard(
      mockMainAccount,
      swapTransaction
    );

    expect(queryByTestId("headline").textContent).toBe("Decentralized Swap");
  });

  it("renders sent headline", () => {
    const { getByText } = renderTransactionCard(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );

    const expectedText = replacePlaceholders(en.transaction_names.send, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders transaction ICPs with - sign", () => {
    const account = mockMainAccount;
    const transaction = mockSentToSubAccountTransaction;
    const { getByTestId } = renderTransactionCard(account, transaction);
    const { displayAmount } = mapNnsTransaction({
      account,
      transaction,
      swapCanisterAccounts: [],
    });

    expect(getByTestId("token-value")?.textContent).toBe(
      `-${formatToken({ value: displayAmount, detailed: true })}`
    );
  });

  it("renders transaction ICPs with + sign", () => {
    const account = mockSubAccount;
    const transaction = mockReceivedFromMainAccountTransaction;
    const { getByTestId } = renderTransactionCard(account, transaction);
    const { displayAmount } = mapNnsTransaction({
      account,
      transaction,
      swapCanisterAccounts: [],
    });

    expect(getByTestId("token-value")?.textContent).toBe(
      `+${formatToken({ value: displayAmount, detailed: true })}`
    );
  });

  it("displays transaction date and time", () => {
    const { getByTestId } = renderTransactionCard(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );

    const div = getByTestId("transaction-date");

    expect(div?.textContent).toContain("Jan 1, 1970");
    expect(normalizeWhitespace(div?.textContent)).toContain("12:00 AM");
  });

  it("displays identifier for received", () => {
    const { getByTestId } = renderTransactionCard(
      mockSubAccount,
      mockReceivedFromMainAccountTransaction
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockMainAccount.identifier);
    expect(identifier).toContain(en.wallet.direction_from);
  });

  it("displays identifier for sent", () => {
    const { getByTestId } = renderTransactionCard(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockSubAccount.identifier);
    expect(identifier).toContain(en.wallet.direction_to);
  });
});
