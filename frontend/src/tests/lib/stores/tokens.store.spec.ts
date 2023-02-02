import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import { get } from "svelte/store";
import { mockCkBTCToken } from "../../mocks/ckbtc-accounts.mock";
import {
  mockSnsFullProject,
  mockSnsToken,
} from "../../mocks/sns-projects.mock";
import { mockTokens } from "../../mocks/tokens.mock";

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
    expect(Object.keys(store)).toHaveLength(0);
  });

  it("should set tokens", () => {
    tokensStore.setTokens(mockTokens);

    const store = get(tokensStore);
    expect(Object.keys(store)).toHaveLength(Object.keys(mockTokens).length);

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
    expect(Object.keys(store)).toHaveLength(Object.keys(mockTokens).length);

    tokensStore.resetUniverse(CKBTC_UNIVERSE_CANISTER_ID);

    const updatedStore = get(tokensStore);

    expect(Object.keys(updatedStore)).toHaveLength(
      Object.keys(mockTokens).length - 1
    );
    expect(updatedStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toBeUndefined();
  });
});
