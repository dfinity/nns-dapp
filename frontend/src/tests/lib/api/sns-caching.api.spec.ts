import { querySnsProjects } from "$lib/api/sns-caching.api";
import { cachingSnsMock } from "../../mocks/sns-caching.mock";
import cachedSnses from "../../mocks/sns-caching.mock.json";

describe("sns-caching api", () => {
  describe("querySnsProjects", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should fetch json", async () => {
      const mockFetch = jest.fn();
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(cachedSnses),
        })
      );
      global.fetch = mockFetch;
      await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.raw.small12.dfinity.network/v1/sns/list/latest/slow.json`
      );
    });

    it("should convert response", async () => {
      const mockFetch = jest.fn();
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(cachedSnses),
        })
      );
      global.fetch = mockFetch;
      const snses = await querySnsProjects();
      const sns = snses.find(({ index }) => index === cachingSnsMock.index);
      expect(sns).toEqual(cachingSnsMock);
    });
  });
});
