import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import tenAggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";

describe("sns-aggregator api", () => {
  describe("querySnsProjects", () => {
    it("should aggregate results across pages when multiple pages have data", async () => {
      const mockFetch = vi.fn((url: string) => {
        if (url.endsWith("/page/0/slow.json")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(tenAggregatedSnses),
          });
        }
        if (url.endsWith("/page/1/slow.json")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([tenAggregatedSnses[0]]),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const projects = await querySnsProjects();

      const base = `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page`;
      const expectedUrls = [0, 1, 2, 3, 4, 5].map(
        (p) => `${base}/${p}/slow.json`
      );
      expectedUrls.forEach((u) => expect(mockFetch).toHaveBeenCalledWith(u));
      expect(mockFetch).toHaveBeenCalledTimes(6);
      expect(projects).toHaveLength(11);
    });

    it("should not fail if second page response is not ok", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const mockFetch = vi.fn((url: string) => {
        if (url.endsWith("/page/0/slow.json")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(tenAggregatedSnses),
          });
        }
        if (url.endsWith("/page/1/slow.json")) {
          return Promise.resolve({ ok: false });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const projects = await querySnsProjects();

      const base = `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page`;
      const expectedUrls = [0, 1, 2, 3, 4, 5].map(
        (p) => `${base}/${p}/slow.json`
      );
      expectedUrls.forEach((u) => expect(mockFetch).toHaveBeenCalledWith(u));
      expect(mockFetch).toHaveBeenCalledTimes(6);
      expect(projects).toHaveLength(10);
    });

    it("should not fail if second page fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const mockFetch = vi.fn((url: string) => {
        if (url.endsWith("/page/0/slow.json")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(tenAggregatedSnses),
          });
        }
        if (url.endsWith("/page/1/slow.json")) {
          return Promise.reject(new Error("Second page doesn't exist"));
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const projects = await querySnsProjects();

      const base = `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page`;
      const expectedUrls = [0, 1, 2, 3, 4, 5].map(
        (p) => `${base}/${p}/slow.json`
      );
      expectedUrls.forEach((u) => expect(mockFetch).toHaveBeenCalledWith(u));
      expect(mockFetch).toHaveBeenCalledTimes(6);
      expect(projects).toHaveLength(10);
    });

    it("should throw when all pages are empty", async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      );
      global.fetch = mockFetch as unknown as typeof fetch;

      await expect(querySnsProjects()).rejects.toThrow(
        "Error loading SNS projects"
      );

      const base = `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page`;
      const expectedUrls = [0, 1, 2, 3, 4, 5].map(
        (p) => `${base}/${p}/slow.json`
      );
      expectedUrls.forEach((u) => expect(mockFetch).toHaveBeenCalledWith(u));
      expect(mockFetch).toHaveBeenCalledTimes(6);
    });
  });
});
