/**
 * @jest-environment jsdom
 */

import * as governanceApi from "$lib/api/sns-governance.api";
import * as services from "$lib/services/sns-parameters.services";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { get } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { snsNervousSystemParametersMock } from "../../mocks/sns-neurons.mock";

describe("sns-parameters-services", () => {
  describe("loadSnsParameters", () => {
    it("should call api.nervousSystemParameters and load neurons in store", async () => {
      const spyQuery = jest
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
  });
});
