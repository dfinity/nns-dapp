import * as governanceApi from "$lib/api/sns-governance.api";
import * as services from "$lib/services/sns-parameters.services";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { snsNervousSystemParametersMock } from "$tests/mocks/sns-neurons.mock";
import { get } from "svelte/store";

describe("sns-parameters-services", () => {
  beforeEach(() => {
    resetIdentity();
  });

  describe("loadSnsParameters", () => {
    afterEach(() => {
      snsParametersStore.reset();
      vi.clearAllMocks();
    });

    it("should call api.nervousSystemParameters and load parameters in store", async () => {
      const spyQuery = vi
        .spyOn(governanceApi, "nervousSystemParameters")
        .mockImplementation(() =>
          Promise.resolve(snsNervousSystemParametersMock)
        );

      await services.loadSnsParameters(mockPrincipal);

      const store = get(snsParametersStore);
      expect(store[mockPrincipal.toText()]?.parameters).toEqual(
        snsNervousSystemParametersMock
      );
      expect(spyQuery).toBeCalled();
    });

    it("should not call api.nervousSystemParameters if parameters are in the store and certified", async () => {
      snsParametersStore.setParameters({
        rootCanisterId: mockPrincipal,
        parameters: snsNervousSystemParametersMock,
        certified: true,
      });
      const spyQuery = vi
        .spyOn(governanceApi, "nervousSystemParameters")
        .mockImplementation(() =>
          Promise.resolve(snsNervousSystemParametersMock)
        );

      await services.loadSnsParameters(mockPrincipal);
      expect(spyQuery).not.toBeCalled();
    });
  });
});
