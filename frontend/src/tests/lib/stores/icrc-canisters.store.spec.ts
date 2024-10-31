import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("icrc canisters store", () => {
  beforeEach(() => {
    defaultIcrcCanistersStore.reset();
  });

  const ledgerCanisterId = principal(0);
  const indexCanisterId = principal(1);

  it("should store one set of canisters", () => {
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId,
      indexCanisterId,
    });

    const store = get(defaultIcrcCanistersStore);
    expect(store[ledgerCanisterId.toText()]).toEqual({
      ledgerCanisterId,
      indexCanisterId,
    });
  });

  it("should store multiple sets of canisters keyed by ledger canister id", () => {
    const ledgerCansisterId2 = principal(2);
    const indexCanisterId2 = principal(3);
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId,
      indexCanisterId,
    });
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: ledgerCansisterId2,
      indexCanisterId: indexCanisterId2,
    });

    const store = get(defaultIcrcCanistersStore);
    expect(store[ledgerCanisterId.toText()]).toEqual({
      ledgerCanisterId,
      indexCanisterId,
    });
    expect(store[ledgerCansisterId2.toText()]).toEqual({
      ledgerCanisterId: ledgerCansisterId2,
      indexCanisterId: indexCanisterId2,
    });
  });
});
