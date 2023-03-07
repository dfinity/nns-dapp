import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { snsNervousSystemParametersMock } from "$tests/mocks/sns-neurons.mock";
import { Principal } from "@dfinity/principal";
import type { NervousSystemParameters } from "@dfinity/sns";
import { get } from "svelte/store";

describe("SNS Parameters store", () => {
  describe("snsParametersStore", () => {
    afterEach(() => snsParametersStore.reset());
    it("should set parameters for a project", () => {
      snsParametersStore.setParameters({
        rootCanisterId: mockPrincipal,
        parameters: snsNervousSystemParametersMock,
        certified: true,
      });

      const parametersInStore = get(snsParametersStore);
      expect(parametersInStore[mockPrincipal.toText()].parameters).toEqual(
        snsNervousSystemParametersMock
      );
    });

    it("should reset parameters for a project", () => {
      snsParametersStore.setParameters({
        rootCanisterId: mockPrincipal,
        parameters: snsNervousSystemParametersMock,
        certified: true,
      });
      snsParametersStore.resetProject(mockPrincipal);

      const parametersInStore = get(snsParametersStore);
      expect(parametersInStore[mockPrincipal.toText()]).toBeUndefined();
    });

    it("should add parameters for another project", () => {
      const params1 = {
        ...snsNervousSystemParametersMock,
        max_age_bonus_percentage: [123n],
      } as NervousSystemParameters;
      const params2 = {
        ...snsNervousSystemParametersMock,
        max_age_bonus_percentage: [321n],
      } as NervousSystemParameters;
      const principal2 = Principal.fromText("aaaaa-aa");

      snsParametersStore.setParameters({
        rootCanisterId: mockPrincipal,
        parameters: params1,
        certified: true,
      });
      snsParametersStore.setParameters({
        rootCanisterId: principal2,
        parameters: params2,
        certified: true,
      });
      const parametersInStore = get(snsParametersStore);
      expect(parametersInStore[mockPrincipal.toText()].parameters).toEqual(
        params1
      );
      expect(parametersInStore[principal2.toText()].parameters).toEqual(
        params2
      );
    });
  });
});
