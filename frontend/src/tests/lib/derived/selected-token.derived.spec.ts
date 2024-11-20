import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKETH_LEDGER_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { selectedTokenStore } from "$lib/derived/selected-token.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { Principal } from "@dfinity/principal";
import { ICPToken } from "@dfinity/utils";
import { get } from "svelte/store";

describe("selectedTokenStore", () => {
  beforeEach(() => {
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
    });
  });

  it("should return ICPToken for NNS universe", () => {
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

    expect(get(selectedTokenStore)).toBe(ICPToken);
  });

  it("should return SNS token for SNS universe", () => {
    const rootCanisterIdText = "dlbnd-beaaa-aaaaa-qaana-cai";
    const rootCanisterId = Principal.fromText(rootCanisterIdText);
    const token = {
      ...mockSnsToken,
      symbol: "YOYO",
    };
    tokensStore.setToken({
      canisterId: rootCanisterId,
      token,
    });

    page.mock({ data: { universe: rootCanisterIdText } });

    expect(get(selectedTokenStore)).toBe(token);
  });

  it("should return ICRC token for ICRC universe", () => {
    tokensStore.setToken({
      canisterId: CKETH_LEDGER_CANISTER_ID,
      token: mockCkETHToken,
    });

    page.mock({ data: { universe: CKETH_LEDGER_CANISTER_ID.toText() } });

    expect(get(selectedTokenStore)).toBe(mockCkETHToken);
  });

  it("should return undefined for unknown token", () => {
    const rootCanisterIdText = "dlbnd-beaaa-aaaaa-qaana-cai";
    page.mock({ data: { universe: rootCanisterIdText } });

    expect(get(selectedTokenStore)).toBeUndefined();
  });
});
