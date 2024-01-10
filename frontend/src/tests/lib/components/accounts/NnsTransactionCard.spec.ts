import type { Transaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import NnsTransactionCard from "$lib/components/accounts/NnsTransactionCard.svelte";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createMockReceiveTransaction,
  createMockSendTransaction,
  mockReceivedFromMainAccountTransaction,
  mockSentToSubAccountTransaction,
} from "$tests/mocks/transaction.mock";
import { TransactionCardPo } from "$tests/page-objects/TransactionCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import { render } from "@testing-library/svelte";

describe("NnsTransactionCard", () => {
  const renderComponent = (
    account = mockMainAccount,
    transaction = mockReceivedFromMainAccountTransaction
  ) => {
    const { container } = render(NnsTransactionCard, {
      props: {
        account,
        transaction,
      },
    });
    return TransactionCardPo.under(new JestPageObjectElement(container));
  };

  it("renders received headline", async () => {
    const po = renderComponent(
      mockSubAccount,
      mockReceivedFromMainAccountTransaction
    );

    expect(await po.getHeadline()).toBe("Received");
  });

  it("renders participate in swap transaction type", async () => {
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
          fee: { e8s: 10_000n },
          amount: { e8s: 110_000_000n },
          to: swapCanisterAccount.toHex(),
        },
      },
    };
    const po = renderComponent(mockMainAccount, swapTransaction);

    expect(await po.getHeadline()).toBe("Decentralization Swap");
  });

  it("renders sent headline", async () => {
    const po = renderComponent(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );

    expect(await po.getHeadline()).toBe("Sent");
  });

  it("renders transaction ICPs with - sign", async () => {
    const account = mockMainAccount;
    const transaction = createMockSendTransaction({
      amount: 123_000_000n,
      fee: 10_000n,
      to: mockSubAccount.identifier,
    });
    const po = renderComponent(account, transaction);

    expect(await po.getAmount()).toBe("-1.2301");
  });

  it("renders transaction ICPs with + sign", async () => {
    const account = mockSubAccount;
    const transaction = createMockReceiveTransaction({
      from: mockMainAccount.identifier,
      amount: 125_000_000n,
      fee: 20_000n,
    });
    const po = renderComponent(account, transaction);

    expect(await po.getAmount()).toBe("+1.25");
  });

  it("displays transaction date and time", async () => {
    const po = renderComponent(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );

    expect(normalizeWhitespace(await po.getDate())).toBe(
      "Jan 1, 1970 12:00 AM"
    );
  });

  it("displays identifier for received", async () => {
    const po = renderComponent(
      mockSubAccount,
      mockReceivedFromMainAccountTransaction
    );
    expect(await po.getIdentifier()).toBe(
      `From: ${mockMainAccount.identifier}`
    );
  });

  it("displays identifier for sent", async () => {
    const po = renderComponent(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );
    expect(await po.getIdentifier()).toBe(`To: ${mockSubAccount.identifier}`);
  });
});
