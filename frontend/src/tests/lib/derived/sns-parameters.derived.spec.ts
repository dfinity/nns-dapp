import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
import { snsAggregatorIncludingAbortedProjectsStore } from "$lib/stores/sns-aggregator.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { convertNervousSystemParameters } from "$lib/utils/sns-aggregator-converters.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import {
  resetSnsProjects,
  setProdSnsProjects,
} from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("SNS Parameters store", () => {
  describe("snsParametersStore", () => {
    it("should set parameters for a project", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData([
        {
          ...aggregatorSnsMockDto,
          canister_ids: {
            ...aggregatorSnsMockDto.canister_ids,
            root_canister_id: mockPrincipal.toText(),
          },
        },
      ]);

      const parametersInStore = get(snsParametersStore);
      expect(parametersInStore[mockPrincipal.toText()].parameters).toEqual(
        convertNervousSystemParameters(
          aggregatorSnsMockDto.nervous_system_parameters
        )
      );
    });

    it("should reset parameters for a project", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData([
        {
          ...aggregatorSnsMockDto,
          canister_ids: {
            ...aggregatorSnsMockDto.canister_ids,
            root_canister_id: mockPrincipal.toText(),
          },
        },
      ]);
      resetSnsProjects();

      const parametersInStore = get(snsParametersStore);
      expect(parametersInStore[mockPrincipal.toText()]).toBeUndefined();
    });

    it("should add parameters for another project", () => {
      const principal2 = Principal.fromText("aaaaa-aa");
      const project1: CachedSnsDto = {
        ...aggregatorSnsMockDto,
        canister_ids: {
          ...aggregatorSnsMockDto.canister_ids,
          root_canister_id: mockPrincipal.toText(),
        },
        nervous_system_parameters: {
          ...aggregatorSnsMockDto.nervous_system_parameters,
          max_age_bonus_percentage: 123,
        },
      };
      const project2: CachedSnsDto = {
        ...aggregatorSnsMockDto,
        canister_ids: {
          ...aggregatorSnsMockDto.canister_ids,
          root_canister_id: principal2.toText(),
        },
        nervous_system_parameters: {
          ...aggregatorSnsMockDto.nervous_system_parameters,
          max_age_bonus_percentage: 321,
        },
      };

      snsAggregatorIncludingAbortedProjectsStore.setData([project1, project2]);

      const parametersInStore = get(snsParametersStore);
      expect(
        parametersInStore[mockPrincipal.toText()].parameters
          .max_age_bonus_percentage
      ).toEqual([123n]);
      expect(
        parametersInStore[principal2.toText()].parameters
          .max_age_bonus_percentage
      ).toEqual([321n]);
    });
  });

  it("should convert prod SNSes without error", async () => {
    await setProdSnsProjects();
    const store = get(snsParametersStore);
    expect(Object.keys(store).length).toBeGreaterThan(25);
  });
});
