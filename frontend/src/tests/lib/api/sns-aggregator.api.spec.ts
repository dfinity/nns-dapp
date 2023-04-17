import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { aggregatorSnsMock } from "$tests/mocks/sns-aggregator.mock";
import aggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";

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
        `https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/list/page/0/slow.json`
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

  it("should include icrc1_total_supply property", async () => {
    const mockFetch = jest.fn();
    const totalSupply = BigInt(2000_000_000);
    const aggregatedSnsesResponse = [
      { ...aggregatedSnses[0], icrc1_total_supply: totalSupply },
    ];
    mockFetch.mockReturnValueOnce(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(aggregatedSnsesResponse),
      })
    );
    global.fetch = mockFetch;
    const snses = await querySnsProjects();
    expect(snses[0].icrc1_total_supply).toEqual(totalSupply);
  });
});
