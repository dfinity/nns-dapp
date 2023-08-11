import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { convertNervousFuncttion } from "$lib/utils/sns-aggregator-converters.utils";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  aggregatorSnsMockDto,
  aggregatorSnsMockWith,
} from "$tests/mocks/sns-aggregator.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { get } from "svelte/store";

describe("nsFunctionsProjectStore", () => {
  const rootCanisterId = rootCanisterIdMock;
  const aggregatorProject = aggregatorSnsMockWith({
    rootCanisterId: rootCanisterId.toText(),
  });

  beforeEach(() => {
    snsAggregatorStore.reset();
    snsFunctionsStore.reset();
  });

  it("returns the functions from snsFunctionsStore", () => {
    const rootCanisterId = rootCanisterIdMock;
    snsFunctionsStore.setProjectFunctions({
      rootCanisterId,
      nsFunctions: [nervousSystemFunctionMock],
      certified: true,
    });

    const store = createSnsNsFunctionsProjectStore(rootCanisterId);
    expect(get(store)).toEqual([nervousSystemFunctionMock]);
  });

  it("returns the functions from snsFunctionsStore when snsAggregatorStore has data", () => {
    snsAggregatorStore.setData([aggregatorProject]);
    const functions = aggregatorSnsMockDto.parameters.functions;
    snsFunctionsStore.setProjectFunctions({
      rootCanisterId,
      nsFunctions: [nervousSystemFunctionMock],
      certified: true,
    });

    const store = createSnsNsFunctionsProjectStore(rootCanisterId);
    expect(get(store)).toEqual([nervousSystemFunctionMock]);
    expect(get(store)).not.toEqual(functions.map(convertNervousFuncttion));
  });

  it("returns the functions from snsAggregator if no functions in snsFunctionsStore", () => {
    snsAggregatorStore.setData([aggregatorProject]);
    const functions = aggregatorSnsMockDto.parameters.functions;

    const store = createSnsNsFunctionsProjectStore(rootCanisterId);
    expect(get(store)).toEqual(functions.map(convertNervousFuncttion));
  });

  it("returns undefined if project is not set in no store", () => {
    const store = createSnsNsFunctionsProjectStore(rootCanisterId);
    expect(get(store)).toBeUndefined();
  });

  it("returns undefined if another project has ns functions but not this one", () => {
    snsFunctionsStore.setProjectFunctions({
      rootCanisterId,
      nsFunctions: [nervousSystemFunctionMock],
      certified: true,
    });
    const storeWithNsFunctions =
      createSnsNsFunctionsProjectStore(rootCanisterId);
    expect(get(storeWithNsFunctions)).not.toBeUndefined();

    const storeWithoutNsFunctions =
      createSnsNsFunctionsProjectStore(mockCanisterId);
    expect(get(storeWithoutNsFunctions)).toBeUndefined();
  });
});
