import { ResponseCache } from "$lib/utils/cache.utils";

describe("cache utils", () => {
  describe("ResponseCache", () => {
    beforeEach(() => {
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });

    it("should set and get certified data", () => {
      const data = "test";
      const cache = new ResponseCache<string>();
      cache.set({ response: data, certified: true });
      expect(cache.getCertifiedData()).toEqual(data);
    });

    it("should set and get uncertified data", () => {
      const data = "test";
      const cache = new ResponseCache<string>();
      cache.set({ response: data, certified: false });
      expect(cache.getUncertifiedData()).toEqual(data);
    });

    it("reset certified should reset all data", () => {
      const data = "test";
      const cache = new ResponseCache<string>();
      cache.set({ response: data, certified: false });
      cache.set({ response: data, certified: true });
      expect(cache.getCertifiedData()).toEqual(data);
      expect(cache.getUncertifiedData()).toEqual(data);

      cache.reset(true);
      expect(cache.getCertifiedData()).toBeUndefined();
      expect(cache.getUncertifiedData()).toBeUndefined();
    });

    it("reset uncertified should not reset uncertified data", () => {
      const data = "test";
      const cache = new ResponseCache<string>();
      cache.set({ response: data, certified: false });
      cache.set({ response: data, certified: true });
      expect(cache.getUncertifiedData()).toEqual(data);

      cache.reset(false);
      expect(cache.getCertifiedData()).toBe(data);
      expect(cache.getUncertifiedData()).toBeUndefined();
    });

    it("shuold not return expried certified data", () => {
      const data = "test";
      const expiration = 1000;
      const cache = new ResponseCache<string>(expiration);
      cache.set({ response: data, certified: true });
      jest.advanceTimersByTime(expiration + 1);
      expect(cache.getCertifiedData()).toBeUndefined();
    });

    it("shuold not return expried uncertified data", () => {
      const data = "test";
      const expiration = 1000;
      const cache = new ResponseCache<string>(expiration);
      cache.set({ response: data, certified: false });
      jest.advanceTimersByTime(expiration + 1);
      expect(cache.getUncertifiedData()).toBeUndefined();
    });
  });
});
