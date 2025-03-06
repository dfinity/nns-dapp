import { queryUserCountryLocation } from "$lib/api/location.api";

describe("location api", () => {
  describe("queryUserCountryLocation", () => {
    describe("if IPLocation service works", () => {
      it("should return country code", async () => {
        const countryCode = "CH";
        const ip = "1.1.1.1";
        const mockFetch = vi.fn();

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ ip }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ country_code2: countryCode }),
          });
        global.fetch = mockFetch;

        const BASE_URL = "https://api.iplocation.net";
        const result = await queryUserCountryLocation();

        expect(result).toEqual(countryCode);
        expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/?cmd=get-ip`);
        expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/?ip=${ip}`);
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    describe("if IPLocation service fails", () => {
      it("should call IpSb service and return country code", async () => {
        const countryCode = "CH";
        const mockFetch = vi.fn();
        mockFetch
          .mockRejectedValueOnce(new Error("Failed"))
          .mockReturnValueOnce(
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ country_code: countryCode }),
            })
          );
        global.fetch = mockFetch;

        const IP_LOCATION_URL = "https://api.iplocation.net/?cmd=get-ip";
        const IP_SB_URL = "https://api.ip.sb/geoip";

        const result = await queryUserCountryLocation();

        expect(result).toEqual(countryCode);

        expect(mockFetch).toHaveBeenCalledWith(IP_LOCATION_URL);
        expect(mockFetch).toHaveBeenCalledWith(IP_SB_URL);
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    describe("if both services fail", () => {
      it("should raise error", async () => {
        const mockFetch = vi.fn();
        mockFetch.mockRejectedValueOnce(
          new Error("Failed to fetch ip from service 1")
        );
        mockFetch.mockRejectedValueOnce(
          new Error("Failed to fetch ip from service 2")
        );
        global.fetch = mockFetch;

        const call = async () => queryUserCountryLocation();
        await expect(call).rejects.toThrow("Failed to fetch ip from service 2");
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });
});
