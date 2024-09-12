import { snsFunctionsStore } from "$lib/derived/sns-functions.derived";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("sns functions store", () => {
  beforeEach(() => {
    resetSnsProjects();
  });

  it("should be set to an empty object", () => {
    const store = get(snsFunctionsStore);
    expect(store).toEqual({});
  });

  it("should set functions for one project", () => {
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        nervousFunctions: [nervousSystemFunctionMock],
      },
    ]);
    const store = get(snsFunctionsStore);
    expect(store[mockPrincipal.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);
  });

  it("should have functions for more than one project", () => {
    const project1 = {
      rootCanisterId: mockPrincipal,
      nervousFunctions: [nervousSystemFunctionMock],
    };
    setSnsProjects([project1]);
    const store = get(snsFunctionsStore);
    expect(store[mockPrincipal.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);

    const rootCanister2 = Principal.from("aaaaa-aa");
    const project2 = {
      rootCanisterId: rootCanister2,
      nervousFunctions: [nervousSystemFunctionMock],
    };
    setSnsProjects([project1, project2]);
    const store2 = get(snsFunctionsStore);
    expect(store2[rootCanister2.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);
  });

  it("should set functions for more than one project at once", () => {
    const rootCanister2 = Principal.from("aaaaa-aa");
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        nervousFunctions: [nervousSystemFunctionMock],
      },
      {
        rootCanisterId: rootCanister2,
        nervousFunctions: [nervousSystemFunctionMock],
      },
    ]);
    const store = get(snsFunctionsStore);
    expect(store[mockPrincipal.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);
    expect(store[rootCanister2.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);
  });

  it("should reset functions for more than one project", () => {
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        nervousFunctions: [nervousSystemFunctionMock],
      },
    ]);
    const store = get(snsFunctionsStore);
    expect(store[mockPrincipal.toText()]?.nsFunctions).toEqual([
      nervousSystemFunctionMock,
    ]);

    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        nervousFunctions: [],
      },
    ]);
    const store2 = get(snsFunctionsStore);
    expect(store2[mockPrincipal.toText()]?.nsFunctions).toEqual([]);
  });
});
