import { AppPath } from "$lib/constants/routes.constants";
import { referrerPathStore } from "$lib/stores/routes.store";
import { get } from "svelte/store";

describe("routes.store", () => {
  describe("referrerPathStore", () => {
    it("should have an initial value", () => {
      expect(get(referrerPathStore)).toEqual([]);
    });

    it("should push a new path", () => {
      referrerPathStore.pushPath(AppPath.Portfolio);

      expect(get(referrerPathStore).length).toEqual(1);
      expect(get(referrerPathStore)).toEqual([AppPath.Portfolio]);
    });

    it("should remove old paths when reaching limit of 10 entries", () => {
      referrerPathStore.pushPath(AppPath.Accounts);
      for (let i = 0; i < 9; i++) {
        referrerPathStore.pushPath(AppPath.Portfolio);
      }

      expect(get(referrerPathStore).length).toEqual(10);
      expect(get(referrerPathStore).at(0)).toEqual(AppPath.Accounts);
      expect(get(referrerPathStore).at(1)).toEqual(AppPath.Portfolio);

      referrerPathStore.pushPath(AppPath.Tokens);

      expect(get(referrerPathStore).length).toEqual(10);
      expect(get(referrerPathStore).at(0)).toEqual(AppPath.Portfolio);
      expect(get(referrerPathStore).at(-1)).toEqual(AppPath.Tokens);
    });
  });
});
