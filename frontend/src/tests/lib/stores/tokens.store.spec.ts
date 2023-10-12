import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockSnsFullProject,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { mockTokens, mockUniversesTokens } from "$tests/mocks/tokens.mock";
import { get } from "svelte/store";

describe("Tokens store", () => {
  afterEach(() => tokensStore.reset());

  const ckBtcData = {
    canisterId: CKBTC_UNIVERSE_CANISTER_ID,
    token: mockCkBTCToken,
    certified: true,
  };

  it("should set token", () => {
    tokensStore.setToken(ckBtcData);

    const store = get(tokensStore);
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].token).toEqual(
      mockCkBTCToken
    );
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].certified).toBeTruthy();
  });

  it("should reset store", () => {
    tokensStore.setToken(ckBtcData);

    tokensStore.reset();

    const store = get(tokensStore);
    // 1 for Nns
    expect(Object.keys(store)).toHaveLength(1);
  });

  it("should set tokens", () => {
    tokensStore.setTokens(mockTokens);

    const store = get(tokensStore);
    expect(Object.keys(store)).toHaveLength(
      Object.keys(mockUniversesTokens).length
    );

    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].token).toEqual(
      mockCkBTCToken
    );
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].certified).toBeTruthy();

    expect(store[mockSnsFullProject.rootCanisterId.toText()].token).toEqual(
      mockSnsToken
    );
    expect(
      store[mockSnsFullProject.rootCanisterId.toText()].certified
    ).toBeTruthy();
  });

  it("should reset particular universe token", () => {
    tokensStore.setTokens(mockTokens);

    const store = get(tokensStore);
    expect(Object.keys(store)).toHaveLength(
      Object.keys(mockUniversesTokens).length
    );

    tokensStore.resetUniverse(CKBTC_UNIVERSE_CANISTER_ID);

    const updatedStore = get(tokensStore);

    expect(Object.keys(updatedStore)).toHaveLength(
      Object.keys(mockUniversesTokens).length - 1
    );
    expect(updatedStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toBeUndefined();
  });
});
