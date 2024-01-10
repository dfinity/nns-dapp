import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("icrc canisters store", () => {
  beforeEach(() => {
    icrcCanistersStore.reset();
  });

  const ledgerCanisterId = principal(0);
  const indexCanisterId = principal(1);

  it("should store one set of canisters", () => {
    icrcCanistersStore.setCanisters({ ledgerCanisterId, indexCanisterId });

    const store = get(icrcCanistersStore);
    expect(store[ledgerCanisterId.toText()]).toEqual({
      ledgerCanisterId,
      indexCanisterId,
    });
  });

  it("should store multiple sets of canisters keyed by ledger canister id", () => {
    const ledgerCansisterId2 = principal(2);
    const indexCanisterId2 = principal(3);
    icrcCanistersStore.setCanisters({
      ledgerCanisterId,
      indexCanisterId,
    });
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: ledgerCansisterId2,
      indexCanisterId: indexCanisterId2,
    });

    const store = get(icrcCanistersStore);
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
