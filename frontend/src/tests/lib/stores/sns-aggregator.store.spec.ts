import { abandonedProjectsCanisterId } from "$lib/constants/canister-ids.constants";
import {
  snsAggregatorIncludingAbortedProjectsStore,
  snsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { aggregatorMockSnsesDataDto } from "$tests/mocks/sns-aggregator.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

describe("sns-aggregator store", () => {
  describe("snsAggregatorIncludingAbortedProjectsStore", () => {
    it("should set aggregator data", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData(
        aggregatorMockSnsesDataDto
      );

      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual(
        aggregatorMockSnsesDataDto
      );
    });

    it("should reset data", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData(
        aggregatorMockSnsesDataDto
      );

      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual(
        aggregatorMockSnsesDataDto
      );

      snsAggregatorIncludingAbortedProjectsStore.reset();
      expect(
        get(snsAggregatorIncludingAbortedProjectsStore).data
      ).toBeUndefined();
    });

    it("should set data even when data is populated", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData(
        aggregatorMockSnsesDataDto
      );

      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual(
        aggregatorMockSnsesDataDto
      );

      snsAggregatorIncludingAbortedProjectsStore.setData([
        aggregatorMockSnsesDataDto[0],
      ]);
      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual([
        aggregatorMockSnsesDataDto[0],
      ]);
    });
  });

  describe("snsAggregatorStore", () => {
    const snsWithLifecycle = ({
      sns,
      lifecycle,
    }: {
      sns: CachedSnsDto;
      lifecycle: SnsSwapLifecycle;
    }) => ({
      ...sns,
      swap_state: {
        ...sns.swap_state,
        swap: {
          ...sns.swap_state.swap,
          lifecycle,
        },
      },
      ...(nonNullish(lifecycle)
        ? {
            lifecycle: {
              ...sns.lifecycle,
              lifecycle,
            },
          }
        : { lifecycle: null }),
    });

    const nonAbortedData = [
      snsWithLifecycle({
        sns: aggregatorMockSnsesDataDto[0],
        lifecycle: SnsSwapLifecycle.Pending,
      }),
      snsWithLifecycle({
        sns: aggregatorMockSnsesDataDto[1],
        lifecycle: SnsSwapLifecycle.Open,
      }),
      snsWithLifecycle({
        sns: aggregatorMockSnsesDataDto[2],
        lifecycle: SnsSwapLifecycle.Committed,
      }),
      snsWithLifecycle({
        sns: aggregatorMockSnsesDataDto[3],
        lifecycle: SnsSwapLifecycle.Adopted,
      }),
    ];

    it("should start empty", () => {
      expect(get(snsAggregatorStore).data).toBeUndefined();
    });

    it("should hold non-aborted projects", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData(nonAbortedData);
      expect(get(snsAggregatorStore).data).toEqual(nonAbortedData);
    });

    it("should not hold aborted projects", () => {
      const abortedProject1 = snsWithLifecycle({
        sns: aggregatorMockSnsesDataDto[4],
        lifecycle: SnsSwapLifecycle.Aborted,
      });
      const abortedProject2 = snsWithLifecycle({
        sns: aggregatorMockSnsesDataDto[5],
        lifecycle: SnsSwapLifecycle.Aborted,
      });
      const data = [abortedProject1, ...nonAbortedData, abortedProject2];

      snsAggregatorIncludingAbortedProjectsStore.setData(data);
      expect(get(snsAggregatorStore).data).toEqual(nonAbortedData);
    });

    it("should not hold projects without lifecycle", () => {
      const projectWithoutLifecycle = snsWithLifecycle({
        sns: aggregatorMockSnsesDataDto[4],
        lifecycle: null,
      });
      const data = [projectWithoutLifecycle, ...nonAbortedData];

      snsAggregatorIncludingAbortedProjectsStore.setData(data);
      expect(get(snsAggregatorStore).data).toEqual(nonAbortedData);
    });
  });

  describe("sunset SNSs", () => {
    const withSunsetSns = ({
      sns,
      rootCanisterId,
    }: {
      sns: CachedSnsDto;
      rootCanisterId: string;
    }) => ({
      ...sns,
      list_sns_canisters: {
        ...sns.list_sns_canisters,
        root: rootCanisterId,
      },
    });

    const mockedSns = aggregatorMockSnsesDataDto[0];
    const sunsetSns = withSunsetSns({
      sns: {
        ...mockedSns,
        meta: {
          ...mockedSns.meta,
          name: "---",
        },
        icrc1_metadata: [...mockedSns.icrc1_metadata].map(([name, value]) => {
          if (name === "icrc1:symbol" && "Text" in value) {
            return [
              name,
              {
                Text: "---",
              },
            ];
          }
          return [name, value];
        }),
      },
      rootCanisterId: abandonedProjectsCanisterId[0],
    });

    it("should filter out SNS if present in abandonedProjects", () => {
      const data = [sunsetSns];
      snsAggregatorIncludingAbortedProjectsStore.setData(data);

      expect(get(snsAggregatorStore).data).toEqual([]);
    });
  });
});
