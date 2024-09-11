import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";

describe("nsFunctionsProjectStore", () => {
  const rootCanisterId = rootCanisterIdMock;

  beforeEach(() => {
    resetSnsProjects();
  });

  it("returns the functions", () => {
    const rootCanisterId = rootCanisterIdMock;
    setSnsProjects([
      {
        rootCanisterId,
        nervousFunctions: [nervousSystemFunctionMock],
      },
    ]);

    const store = createSnsNsFunctionsProjectStore(rootCanisterId);
    expect(get(store)).toEqual([nervousSystemFunctionMock]);
  });

  it("returns undefined if project is not set in no store", () => {
    const store = createSnsNsFunctionsProjectStore(rootCanisterId);
    expect(get(store)).toBeUndefined();
  });

  it("returns undefined if another project has ns functions but not this one", () => {
    setSnsProjects([
      {
        rootCanisterId,
        nervousFunctions: [nervousSystemFunctionMock],
      },
    ]);
    const storeWithNsFunctions =
      createSnsNsFunctionsProjectStore(rootCanisterId);
    expect(get(storeWithNsFunctions)).not.toBeUndefined();

    const storeWithoutNsFunctions =
      createSnsNsFunctionsProjectStore(mockCanisterId);
    expect(get(storeWithoutNsFunctions)).toBeUndefined();
  });
});
