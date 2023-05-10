import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { aggregatorSnsMock } from "$tests/mocks/sns-aggregator.mock";
import aggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";
import { vi } from "vitest";

describe("sns-aggregator api", () => {
  describe("querySnsProjects", () => {
    afterEach(() => {
      vi.resetAllMocks();
    });
    it("should fetch json", async () => {
      const mockFetch = vi.fn();
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(aggregatedSnses),
        })
      );
      global.fetch = mockFetch;
      await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/0/slow.json`
      );
    });

    it("should convert response", async () => {
      const mockFetch = vi.fn();
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(aggregatedSnses),
        })
      );
      global.fetch = mockFetch;
      const snses = await querySnsProjects();
      const sns = snses.find(({ index }) => index === aggregatorSnsMock.index);
      expect(sns).toEqual(aggregatorSnsMock);
    });
  });
});
