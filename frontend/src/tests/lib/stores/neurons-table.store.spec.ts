import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import { get } from "svelte/store";

describe("neurons-table.store", () => {
  describe("neuronsTableOrderStore", () => {
    it("should have an initial value", () => {
      expect(get(neuronsTableOrderStore)).toEqual([
        {
          columnId: "stake",
        },
        {
          columnId: "dissolveDelay",
        },
        {
          columnId: "id",
        },
      ]);
    });

    it("should set and reset", () => {
      neuronsTableOrderStore.set([
        {
          columnId: "dissolveDelay",
        },
      ]);

      expect(get(neuronsTableOrderStore)).toEqual([
        {
          columnId: "dissolveDelay",
        },
      ]);

      neuronsTableOrderStore.reset();

      expect(get(neuronsTableOrderStore)).toEqual([
        {
          columnId: "stake",
        },
        {
          columnId: "dissolveDelay",
        },
        {
          columnId: "id",
        },
      ]);
    });
  });
});
