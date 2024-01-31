import { ckBTCUniverseStore } from "$lib/derived/ckbtc-universe.derived";
import { ckBTCUniverseMock } from "$tests/mocks/universe.mock";
import { get } from "svelte/store";

describe("ckBTC universe store", () => {
  it("returns NNS universe", () => {
    expect(get(ckBTCUniverseStore)).toEqual(ckBTCUniverseMock);
  });
});
