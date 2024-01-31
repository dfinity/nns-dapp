import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { get } from "svelte/store";

describe("icrc-transactions", () => {
  it("should reset account", () => {
    const otherAccountIdentifier = "otherAccountIdentifier";

    icrcTransactionsStore.addTransactions({
      canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      transactions: [mockIcrcTransactionWithId],
      accountIdentifier: mockCkBTCMainAccount.identifier,
      oldestTxId: 10n,
      completed: false,
    });

    const accounts = get(icrcTransactionsStore);
    expect(
      accounts[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]
    ).not.toBeUndefined();
    expect(
      accounts[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()][
        mockCkBTCMainAccount.identifier
      ]
    ).not.toBeUndefined();

    icrcTransactionsStore.addTransactions({
      canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      transactions: [mockIcrcTransactionWithId],
      accountIdentifier: otherAccountIdentifier,
      oldestTxId: 10n,
      completed: false,
    });

    const accounts2 = get(icrcTransactionsStore);
    expect(
      accounts2[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()][otherAccountIdentifier]
    ).not.toBeUndefined();

    icrcTransactionsStore.resetAccount({
      universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      accountIdentifier: mockCkBTCMainAccount.identifier,
    });

    const accounts3 = get(icrcTransactionsStore);
    expect(
      accounts3[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]
    ).not.toBeUndefined();
    expect(
      accounts3[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()][
        mockCkBTCMainAccount.identifier
      ]
    ).toBeUndefined();
  });

  it("should dedupe transactions", () => {
    const canisterId = CKTESTBTC_UNIVERSE_CANISTER_ID;
    const identifier = mockCkBTCMainAccount.identifier;

    icrcTransactionsStore.addTransactions({
      canisterId,
      transactions: [mockIcrcTransactionWithId],
      accountIdentifier: identifier,
      oldestTxId: 10n,
      completed: false,
    });

    expect(
      get(icrcTransactionsStore)[canisterId.toText()][identifier].transactions
        .length
    ).toBe(1);

    icrcTransactionsStore.addTransactions({
      canisterId,
      transactions: [mockIcrcTransactionWithId, mockIcrcTransactionWithId],
      accountIdentifier: identifier,
      oldestTxId: 10n,
      completed: false,
    });

    expect(
      get(icrcTransactionsStore)[canisterId.toText()][identifier].transactions
        .length
    ).toBe(1);
  });
});
