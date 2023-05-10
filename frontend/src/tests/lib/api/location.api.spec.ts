import { queryUserCountryLocation } from "$lib/api/location.api";
import { vi } from "vitest";

describe("location api", () => {
  describe("queryUserCountryLocation", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    describe("if GeoIP service works", () => {
      it("should return country code", async () => {
        const countryCode = "CH";
        const mockFetch = vi.fn();
        mockFetch.mockReturnValueOnce(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ countrycode: countryCode }),
          })
        );
        global.fetch = mockFetch;

        const result = await queryUserCountryLocation();
        expect(result).toEqual(countryCode);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.geoiplookup.net/?json=true"
        );
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    describe("if GeoIP service fails", () => {
      it("should call IPLocation service and return country code", async () => {
        const countryCode = "CH";
        const ip = "1.1.1.1";
        const mockFetch = vi.fn();
        mockFetch
          .mockReturnValueOnce(
            Promise.resolve({
              ok: false,
            })
          )
          .mockReturnValueOnce(
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ ip }),
            })
          )
          .mockReturnValueOnce(
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ country_code2: countryCode }),
            })
          );
        global.fetch = mockFetch;

        const BASE_URL = "https://api.iplocation.net";
        const result = await queryUserCountryLocation();
        expect(result).toEqual(countryCode);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.geoiplookup.net/?json=true"
        );
        expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/?cmd=get-ip`);
        expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/?ip=${ip}`);
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });
    });

    describe("if GeoIP and IPLocation services fail", () => {
      it("should raise error", async () => {
        const mockFetch = vi.fn();
        mockFetch.mockReturnValue(
          Promise.resolve({
            ok: false,
          })
        );
        global.fetch = mockFetch;

        const call = async () => queryUserCountryLocation();
        await expect(call).rejects.toThrow(
          "Failed to fetch ip from IP Location"
        );
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });
});
