import { ckTESTBTCUniverseStore } from "$lib/derived/cktestbtc-universe.derived";
import { ckTESTBTCUniverseMock } from "$tests/mocks/universe.mock";
import { get } from "svelte/store";

describe("ckTESTBTC universe store", () => {
  it("returns NNS universe", () => {
    expect(get(ckTESTBTCUniverseStore)).toEqual(ckTESTBTCUniverseMock);
  });
});
