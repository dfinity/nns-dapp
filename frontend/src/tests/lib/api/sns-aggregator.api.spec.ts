import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { aggregatorSnsMock } from "../../mocks/sns-aggregator.mock";
import aggregatedSnses from "../../mocks/sns-aggregator.mock.json";

describe("sns-aggregator api", () => {
  describe("querySnsProjects", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should fetch json", async () => {
      const mockFetch = jest.fn();
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(aggregatedSnses),
        })
      );
      global.fetch = mockFetch;
      await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/latest/slow.json`
      );
    });

    it("should convert response", async () => {
      const mockFetch = jest.fn();
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
