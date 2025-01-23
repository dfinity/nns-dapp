import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("icrcCanistersStore", () => {
  const ledgerCanisterId = principal(0);
  const indexCanisterId = principal(1);
  const ledgerCanisterId2 = principal(2);
  const ledgerCanisterId3 = principal(3);

  it("returns empty object when no icrc tokens are present", () => {
    expect(get(icrcCanistersStore)).toEqual({});
  });

  it("return data from defaultIcrcCanistersStore", () => {
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId,
      indexCanisterId,
    });

    expect(get(icrcCanistersStore)).toEqual({
      [ledgerCanisterId.toText()]: {
        ledgerCanisterId,
        indexCanisterId,
      },
    });
  });

  it("return data from importedTokensStore", () => {
    importedTokensStore.set({
      importedTokens: [
        {
          ledgerCanisterId,
          indexCanisterId: undefined,
        },
      ],
      certified: true,
    });

    expect(get(icrcCanistersStore)).toEqual({
      [ledgerCanisterId.toText()]: {
        ledgerCanisterId,
      },
    });
  });

  it("excludes failed imported tokens", () => {
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId,
      indexCanisterId,
    });
    importedTokensStore.set({
      importedTokens: [
        {
          ledgerCanisterId: ledgerCanisterId2,
          indexCanisterId: undefined,
        },
        {
          ledgerCanisterId: ledgerCanisterId3,
          indexCanisterId: undefined,
        },
      ],
      certified: true,
    });
    failedImportedTokenLedgerIdsStore.add(ledgerCanisterId2.toText());

    expect(get(icrcCanistersStore)).toEqual({
      [ledgerCanisterId.toText()]: {
        ledgerCanisterId,
        indexCanisterId,
      },
      [ledgerCanisterId3.toText()]: {
        ledgerCanisterId: ledgerCanisterId3,
      },
    });
  });

  it("return data from the defaultIcrcCanistersStore and the importedTokensStore", () => {
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId,
      indexCanisterId,
    });
    importedTokensStore.set({
      importedTokens: [
        {
          ledgerCanisterId: ledgerCanisterId2,
          indexCanisterId: undefined,
        },
      ],
      certified: true,
    });

    expect(get(icrcCanistersStore)).toEqual({
      [ledgerCanisterId.toText()]: {
        ledgerCanisterId,
        indexCanisterId,
      },
      [ledgerCanisterId2.toText()]: {
        ledgerCanisterId: ledgerCanisterId2,
      },
    });
  });
});
