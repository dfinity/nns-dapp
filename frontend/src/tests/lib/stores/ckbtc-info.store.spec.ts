import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import { get } from "svelte/store";

describe("ckBTC info store", () => {
  afterEach(() => ckBTCInfoStore.reset());

  const ckBtcData = {
    canisterId: CKBTC_UNIVERSE_CANISTER_ID,
    info: mockCkBTCMinterInfo,
    certified: true,
  };

  it("should set info", () => {
    ckBTCInfoStore.setInfo(ckBtcData);

    const store = get(ckBTCInfoStore);
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].info).toEqual(
      mockCkBTCMinterInfo
    );
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].certified).toBeTruthy();
  });

  it("should reset store", () => {
    ckBTCInfoStore.setInfo(ckBtcData);

    ckBTCInfoStore.reset();

    const store = get(ckBTCInfoStore);
    expect(Object.keys(store).length).toEqual(0);
  });

  it("should set multiple info", () => {
    ckBTCInfoStore.setInfo(ckBtcData);
    ckBTCInfoStore.setInfo({
      ...ckBtcData,
      canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    });

    const store = get(ckBTCInfoStore);
    expect(Object.keys(store)).toHaveLength(2);

    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].info).toEqual(
      mockCkBTCMinterInfo
    );
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].certified).toBeTruthy();

    expect(store[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()].info).toEqual(
      mockCkBTCMinterInfo
    );
    expect(
      store[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()].certified
    ).toBeTruthy();
  });

  it("should reset a particular universe info", () => {
    ckBTCInfoStore.setInfo(ckBtcData);
    ckBTCInfoStore.setInfo({
      ...ckBtcData,
      canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    });

    const store = get(ckBTCInfoStore);
    expect(Object.keys(store)).toHaveLength(2);

    ckBTCInfoStore.resetUniverse(CKBTC_UNIVERSE_CANISTER_ID);

    const updatedStore = get(ckBTCInfoStore);

    expect(Object.keys(updatedStore)).toHaveLength(1);
    expect(updatedStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toBeUndefined();
  });
});
