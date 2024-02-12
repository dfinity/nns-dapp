import {
  clearSnsAggregatorCache,
  snsAggregatorApiService,
} from "$lib/api-services/sns-aggregator.api-service";
import * as aggregatorApi from "$lib/api/sns-aggregator.api";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";

vi.mock("$lib/api/sns-aggregator.api");

const blockedPaths = ["$lib/api/sns-aggregator.api"];

describe("sns-aggregator api-service", () => {
  blockAllCallsTo(blockedPaths);

  beforeEach(() => {
    clearSnsAggregatorCache();
  });

  describe("querySnsProjects succeeds", () => {
    beforeEach(() => {
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve([aggregatorSnsMockDto, aggregatorSnsMockDto])
      );
    });

    it("should return cached data if it's not expired", async () => {
      const result = await snsAggregatorApiService.querySnsProjects();
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

      await runResolvedPromises();

      const result2 = await snsAggregatorApiService.querySnsProjects();
      expect(result).toBe(result2);
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);
    });

    it("should return call api once for two parallel calls", async () => {
      const [result, result2] = await Promise.all([
        snsAggregatorApiService.querySnsProjects(),
        snsAggregatorApiService.querySnsProjects(),
      ]);

      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);
      expect(result).toBe(result2);
    });

    it("should call api once for simultaneous calls", async () => {
      const promise1 = snsAggregatorApiService.querySnsProjects();
      const promise2 = snsAggregatorApiService.querySnsProjects();
      expect(promise1).toStrictEqual(promise2);
      expect(await promise1).toEqual([
        aggregatorSnsMockDto,
        aggregatorSnsMockDto,
      ]);
      expect(await promise2).toEqual([
        aggregatorSnsMockDto,
        aggregatorSnsMockDto,
      ]);
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);
    });

    it("should expire its cache after 5 minutes", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2020-8-1 21:55:00"));

      const result = await snsAggregatorApiService.querySnsProjects();
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

      vi.setSystemTime(new Date("2020-8-1 21:59:59"));

      const result2 = await snsAggregatorApiService.querySnsProjects();
      expect(result).toBe(result2);
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

      vi.setSystemTime(new Date("2020-8-1 22:00:01"));

      const result3 = await snsAggregatorApiService.querySnsProjects();
      expect(result).not.toBe(result3);
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(2);
    });
  });

  describe("querySnsProjects fails", () => {
    beforeEach(() => {
      vi.spyOn(aggregatorApi, "querySnsProjects")
        .mockRejectedValueOnce(new Error("test"))
        .mockResolvedValue([aggregatorSnsMockDto, aggregatorSnsMockDto]);
    });

    it("should invalidate cache if querySnsProjects fails", async () => {
      const failCall = () => snsAggregatorApiService.querySnsProjects();
      expect(failCall).rejects.toThrow();
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

      await runResolvedPromises();

      const result = await snsAggregatorApiService.querySnsProjects();
      expect(result).toEqual([aggregatorSnsMockDto, aggregatorSnsMockDto]);
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(2);
    });

    it("should use cached error until promise resolves", async () => {
      const failCall = () => snsAggregatorApiService.querySnsProjects();
      expect(failCall).rejects.toThrow();
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

      const failCallAgain = () => snsAggregatorApiService.querySnsProjects();
      expect(failCallAgain).rejects.toThrow();
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

      await runResolvedPromises();

      const result = await snsAggregatorApiService.querySnsProjects();
      expect(result).toEqual([aggregatorSnsMockDto, aggregatorSnsMockDto]);
      expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(2);
    });
  });
});
