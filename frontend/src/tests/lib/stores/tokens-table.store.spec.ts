import { tokensTableOrderStore } from "$lib/stores/tokens-table.store";
import { get } from "svelte/store";

describe("tokens-table.store", () => {
  describe("tokensTableOrderStore", () => {
    it("should have an initial value", () => {
      expect(get(tokensTableOrderStore)).toEqual([
        {
          columnId: "balance",
        },
        {
          columnId: "title",
        },
      ]);
    });

    it("should set", () => {
      tokensTableOrderStore.set([
        {
          columnId: "title",
        },
      ]);

      expect(get(tokensTableOrderStore)).toEqual([
        {
          columnId: "title",
        },
      ]);
    });
  });
});
