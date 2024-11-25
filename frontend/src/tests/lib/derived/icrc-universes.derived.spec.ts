import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_LEDGER_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
  CKETH_INDEX_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { icrcTokensUniversesStore } from "$lib/derived/icrc-universes.derived";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
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
  it("returns empty array if no tokens are present", () => {
    defaultIcrcCanistersStore.setCanisters({
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
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
    expect(get(icrcTokensUniversesStore)).toEqual([ckETHUniverseMock]);
  });

  it("returns ckETH and ckSEPOLIA universes if present in icrcCanistersStore", () => {
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
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
      indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
    });
    expect(get(icrcTokensUniversesStore)).toEqual([
      ckETHUniverseMock,
      ckETHSEPOLIAUniverseMock,
    ]);
  });

  it("returns question mark logo if logo not present in token and it's not a ckBTC nor ckETH canister", () => {
    const ledgerCanisterId = principal(1);
    tokensStore.setTokens({
      [ledgerCanisterId.toText()]: {
        certified: true,
        token: mockToken,
      },
    });
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: ledgerCanisterId,
      indexCanisterId: principal(2),
    });
    expect(get(icrcTokensUniversesStore)).toMatchObject([
      {
        logo: "/src/lib/assets/question-mark.svg",
      },
    ]);
  });

  it("returns logo from the token", () => {
    const ledgerCanisterId = principal(1);
    const logo = "data:image/svg+xml;base64,PHN2ZyB3...";
    tokensStore.setTokens({
      [ledgerCanisterId.toText()]: {
        certified: true,
        token: {
          ...mockToken,
          logo,
        },
      },
    });
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: ledgerCanisterId,
      indexCanisterId: principal(2),
    });
    expect(get(icrcTokensUniversesStore)).toMatchObject([
      {
        logo,
      },
    ]);
  });
});
