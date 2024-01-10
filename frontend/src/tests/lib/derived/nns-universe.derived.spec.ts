import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
import { nnsUniverseMock } from "$tests/mocks/universe.mock";
import { get } from "svelte/store";

describe("nns universe store", () => {
  it("returns NNS universe", () => {
    expect(get(nnsUniverseStore)).toEqual(nnsUniverseMock);
  });
});
