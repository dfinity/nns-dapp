import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { aggregatorSnsMock } from "$tests/mocks/sns-aggregator.mock";
import tenAggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";

describe("sns-aggregator api", () => {
  describe("querySnsProjects", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should fetch json once if less than 10 SNSes", async () => {
      const mockFetch = jest.fn();
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
      const mockFetch = jest.fn();
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
      await querySnsProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/0/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledWith(
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/1/slow.json`
      );
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should convert response", async () => {
      const mockFetch = jest.fn();
      mockFetch.mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([tenAggregatedSnses[7]]),
        })
      );
      global.fetch = mockFetch;
      const snses = await querySnsProjects();
      const sns = snses.find(({ index }) => index === aggregatorSnsMock.index);
      // TODO: Make clear that aggregatorSnsMock is the first in the list of aggregated SNSes
      expect(sns).toEqual(aggregatorSnsMock);
    });
  });
});
