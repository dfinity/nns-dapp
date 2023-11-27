import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_LEDGER_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
  CKETH_INDEX_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { icrcTokensUniversesStore } from "$lib/derived/icrc-universes.derived";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  mockCkETHTESTToken,
  mockCkETHToken,
} from "$tests/mocks/cketh-accounts.mock";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import {
  ckETHSEPOLIAUniverseMock,
  ckETHUniverseMock,
} from "$tests/mocks/universe.mock";
import { get } from "svelte/store";

describe("icrcTokensUniversesStore", () => {
  beforeEach(() => {
    tokensStore.reset();
    icrcCanistersStore.reset();
  });

  it("returns empty array if no tokens are present", () => {
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
    expect(get(icrcTokensUniversesStore)).toEqual([]);
  });

  it("returns empty array if no canister ids are present", () => {
    tokensStore.setTokens({
      [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
        certified: true,
        token: mockCkETHToken,
      },
      [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: {
        certified: true,
        token: mockCkETHTESTToken,
      },
    });
    expect(get(icrcTokensUniversesStore)).toEqual([]);
  });

  it("returns ckETH universe if present in icrcCanistersStore", () => {
    tokensStore.setTokens({
      [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
        certified: true,
        token: mockCkETHToken,
      },
    });
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
    expect(get(icrcTokensUniversesStore)).toEqual([ckETHUniverseMock]);
  });

  // TODO: Enable when we have ckETH mainnet canister ids
  it.skip("returns ckETH and ckSEPOLIA universes if present in icrcCanistersStore", () => {
    tokensStore.setTokens({
      [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
        certified: true,
        token: mockCkETHToken,
      },
      [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: {
        certified: true,
        token: mockCkETHTESTToken,
      },
    });
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
      indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
    });
    expect(get(icrcTokensUniversesStore)).toEqual([
      ckETHUniverseMock,
      ckETHSEPOLIAUniverseMock,
    ]);
  });

  // TODO: https://dfinity.atlassian.net/browse/GIX-2140
  it("doesn't return non-cketh universes", () => {
    // For not it's because the logo is not yet parsed in the token.
    const ledgerCanisterId = principal(1);
    tokensStore.setTokens({
      [ledgerCanisterId.toText()]: {
        certified: true,
        token: mockToken,
      },
    });
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: ledgerCanisterId,
      indexCanisterId: principal(2),
    });
    expect(get(icrcTokensUniversesStore)).toEqual([]);
  });
});
