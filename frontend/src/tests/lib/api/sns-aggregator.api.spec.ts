import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import tenAggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";

describe("sns-aggregator api", () => {
  describe("querySnsProjects", () => {
    it("should fetch json once if less than 10 SNSes", async () => {
      const mockFetch = vi.fn();
      const [_first, ...nineSnses] = tenAggregatedSnses;
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(nineSnses),
        })
      );
      global.fetch = mockFetch;
      await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/0/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should fetch next page if there are 10 SNSes", async () => {
      const mockFetch = vi.fn();
      mockFetch
        .mockReturnValueOnce(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(tenAggregatedSnses),
          })
        )
        .mockReturnValueOnce(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve([tenAggregatedSnses[0]]),
          })
        );
      global.fetch = mockFetch;
      const projects = await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/0/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/1/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(projects).toHaveLength(11);
    });

    it("should work even when second page is empty", async () => {
      const mockFetch = vi.fn();
      mockFetch
        .mockReturnValueOnce(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(tenAggregatedSnses),
          })
        )
        .mockReturnValueOnce(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          })
        );
      global.fetch = mockFetch;
      const projects = await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/0/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/1/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(projects).toHaveLength(10);
    });

    it("should not fail if second page response is not ok", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const mockFetch = vi.fn();
      mockFetch
        .mockReturnValueOnce(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(tenAggregatedSnses),
          })
        )
        .mockReturnValueOnce(
          Promise.resolve({
            ok: false,
          })
        );
      global.fetch = mockFetch;
      const projects = await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/0/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/1/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(projects).toHaveLength(10);
    });

    it("should not fail if second page failes", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const mockFetch = vi.fn();
      mockFetch
        .mockReturnValueOnce(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(tenAggregatedSnses),
          })
        )
        .mockReturnValueOnce(new Error("Second page doesn't exist"));
      global.fetch = mockFetch;
      const projects = await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/0/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/1/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(projects).toHaveLength(10);
    });

    it("should not convert response", async () => {
      const mockFetch = vi.fn();
      mockFetch.mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([aggregatorSnsMockDto]),
        })
      );
      global.fetch = mockFetch;
      const snses = await querySnsProjects();
      expect(snses).toEqual([aggregatorSnsMockDto]);
    });
  });
});
