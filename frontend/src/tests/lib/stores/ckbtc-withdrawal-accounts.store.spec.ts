import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import {
  mockCkBTCWithdrawalAccount,
  mockCkBTCWithdrawalIcrcAccount,
  mockCkBTCWithdrawalIdentifier,
} from "$tests/mocks/ckbtc-accounts.mock";
import { get } from "svelte/store";

describe("ckbtc-withdrawal-accounts-store", () => {
  beforeEach(() => ckBTCWithdrawalAccountsStore.reset());

  it("should set withdrawal account", () => {
    const store = get(ckBTCWithdrawalAccountsStore);
    expect(Object.keys(store).length).toEqual(0);

    ckBTCWithdrawalAccountsStore.set({
      account: {
        account: mockCkBTCWithdrawalAccount,
        certified: true,
      },
      universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    });
    const store2 = get(ckBTCWithdrawalAccountsStore);
    expect(Object.keys(store2).length).toEqual(1);
    expect(store2[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]).not.toBeUndefined();
    expect(
      store2[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]?.account.identifier
    ).toEqual(mockCkBTCWithdrawalIdentifier);
    expect(
      store2[
        CKTESTBTC_UNIVERSE_CANISTER_ID.toText()
      ]?.account.principal.toText()
    ).toEqual(mockCkBTCWithdrawalIcrcAccount.owner.toText());
    expect(
      store2[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]?.account.balance.toE8s()
    ).toEqual(mockCkBTCWithdrawalAccount.balance.toE8s());
  });

  it("should reset", () => {
    const store = get(ckBTCWithdrawalAccountsStore);
    expect(Object.keys(store).length).toEqual(0);

    ckBTCWithdrawalAccountsStore.set({
      account: {
        account: mockCkBTCWithdrawalAccount,
        certified: true,
      },
      universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    });
    const store2 = get(ckBTCWithdrawalAccountsStore);
    expect(Object.keys(store2).length).toEqual(1);

    ckBTCWithdrawalAccountsStore.reset();
    const store3 = get(ckBTCWithdrawalAccountsStore);
    expect(Object.keys(store3).length).toEqual(0);
  });
});
