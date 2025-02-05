import {
  clearSnsAggregatorCache,
  snsAggregatorApiService,
} from "$lib/api-services/sns-aggregator.api-service";
import * as aggregatorApi from "$lib/api/sns-aggregator.api";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";

vi.mock("$lib/api/sns-aggregator.api");

const blockedPaths = ["$lib/api/sns-aggregator.api"];

describe("sns-aggregator api-service", () => {
  blockAllCallsTo(blockedPaths);

  const successData = [aggregatorSnsMockDto, aggregatorSnsMockDto];
  let resolveFn = undefined;
  let rejectFn = undefined;

  beforeEach(() => {
    clearSnsAggregatorCache();
    resolveFn = undefined;
    rejectFn = undefined;
    vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(
      () =>
        new Promise<CachedSnsDto[]>((r, rej) => {
          resolveFn = r;
          rejectFn = rej;
        })
    );
  });

  it("should return cached data if it's not expired", async () => {
    const promise1 = snsAggregatorApiService.querySnsProjects();
    resolveFn(successData);
    const result1 = await promise1;
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

    const result2 = await snsAggregatorApiService.querySnsProjects();
    expect(result1).toBe(result2);
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);
  });

  it("should call api once for simultaneous calls", async () => {
    const promise1 = snsAggregatorApiService.querySnsProjects();
    const promise2 = snsAggregatorApiService.querySnsProjects();
    expect(promise1).toBe(promise2);

    resolveFn(successData);
    expect(await promise1).toEqual(successData);
    expect(await promise2).toEqual(successData);
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);
  });

  it("should expire its cache after 5 minutes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-8-1 21:55:00"));

    const promise1 = snsAggregatorApiService.querySnsProjects();

    resolveFn(successData);
    const result = await promise1;
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2020-8-1 21:59:59"));

    const result2 = await snsAggregatorApiService.querySnsProjects();
    expect(result).toBe(result2);
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2020-8-1 22:00:01"));

    const promise3 = snsAggregatorApiService.querySnsProjects();

    resolveFn([aggregatorSnsMockDto]);
    const result3 = await promise3;
    expect(result).not.toBe(result3);
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(2);
  });

  it("should invalidate cache if querySnsProjects fails", async () => {
    const promise1 = snsAggregatorApiService.querySnsProjects();
    const err = new Error("test 1");
    rejectFn(err);
    await expect(promise1).rejects.toThrow(err);

    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

    const promise2 = snsAggregatorApiService.querySnsProjects();
    resolveFn(successData);
    expect(await promise2).toEqual(successData);
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(2);
  });

  it("should use cached error until promise resolves", async () => {
    const promise1 = snsAggregatorApiService.querySnsProjects();
    const promise2 = snsAggregatorApiService.querySnsProjects();

    const err = new Error("test 1");
    rejectFn(err);
    await expect(promise2).rejects.toThrow(err);
    await expect(promise1).rejects.toThrow(err);
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);

    const promise3 = snsAggregatorApiService.querySnsProjects();
    resolveFn(successData);
    expect(await promise3).toEqual([
      aggregatorSnsMockDto,
      aggregatorSnsMockDto,
    ]);
    expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(2);
  });
});
