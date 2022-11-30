import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { nervousSystemFunctionMock } from "../../mocks/sns-functions.mock";

describe("sns functions store", () => {
  afterEach(() => snsFunctionsStore.reset());
  it("should be set to an empty object", () => {
    const store = get(snsFunctionsStore);
    expect(store).toEqual({});
  });

  it("should set functions for one project", () => {
    snsFunctionsStore.setFunctions({
      rootCanisterId: mockPrincipal,
      nsFunctions: [nervousSystemFunctionMock],
      certified: true,
    });
    const store = get(snsFunctionsStore);
    expect(store[mockPrincipal.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);
  });

  it("should set functions for more than one project", () => {
    snsFunctionsStore.setFunctions({
      rootCanisterId: mockPrincipal,
      nsFunctions: [nervousSystemFunctionMock],
      certified: true,
    });
    const store = get(snsFunctionsStore);
    expect(store[mockPrincipal.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);

    const rootCanister2 = Principal.from("aaaaa-aa");
    snsFunctionsStore.setFunctions({
      rootCanisterId: rootCanister2,
      nsFunctions: [nervousSystemFunctionMock],
      certified: true,
    });
    const store2 = get(snsFunctionsStore);
    expect(store2[rootCanister2.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);
  });

  it("should reset functions for more than one project", () => {
    snsFunctionsStore.setFunctions({
      rootCanisterId: mockPrincipal,
      nsFunctions: [nervousSystemFunctionMock],
      certified: true,
    });
    const store = get(snsFunctionsStore);
    expect(store[mockPrincipal.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);

    snsFunctionsStore.setFunctions({
      rootCanisterId: mockPrincipal,
      nsFunctions: [],
      certified: true,
    });
    const store2 = get(snsFunctionsStore);
    expect(store2[mockPrincipal.toText()]?.nsFunctions).toEqual([]);
  });
});
