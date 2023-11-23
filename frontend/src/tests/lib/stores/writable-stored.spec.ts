import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import { get } from "svelte/store";
import { describe } from "vitest";

describe("writableStored", () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("writes to local storage when state changes", () => {
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue: { filter: "new" },
    });

    const newState = { filter: "old" };
    store.set(newState);

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
    ).toEqual(JSON.stringify(newState));
  });

  it("loads initial value from local storage if present", () => {
    const storedState = { filter: "old" };
    window.localStorage.setItem(
      StoreLocalStorageKey.ProposalFilters,
      JSON.stringify(storedState)
    );
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue: { filter: "new" },
    });

    expect(get(store)).toEqual(storedState);
  });

  it("loads default value if no value in local storage", () => {
    const defaultValue = { filter: "new" };
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue,
    });

    expect(get(store)).toEqual(defaultValue);
  });

  it("should serialize bigint values", () => {
    const defaultValue =
      1000000000000000000000000000000000000000000000000000000n;
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue,
    });
    expect(get(store)).toEqual(defaultValue);

    const store2 = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue: 1,
    });
    expect(get(store2)).toEqual(defaultValue);
  });

  describe("version upgrade", () => {
    it("should replace value from local storage when it has not the same version", () => {
      const storedState = "123";
      const defaultValue = { newValue: 123 };
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify({ data: storedState, version: 0 })
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
        version: 1,
      });

      expect(get(store)).toEqual(defaultValue);
    });

    it("should replace value from local storage even when it has newer version", () => {
      const storedState = null;
      const defaultValue = 123;
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify({ data: storedState, version: 2 })
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
        version: 1,
      });

      expect(get(store)).toEqual(defaultValue);
      expect(
        localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
      ).toEqual(
        JSON.stringify({
          data: defaultValue,
          version: 1,
        })
      );
    });

    it("should replace value from local storage even when the default has no version", () => {
      const storedState = null;
      const defaultValue = 123;
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify({ data: storedState, version: 2 })
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
      });

      expect(get(store)).toEqual(defaultValue);
      expect(
        localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
      ).toEqual(JSON.stringify(defaultValue));
    });

    it("should not replace value in local storage when no versions provided", () => {
      const storedState = { filter: "old" };
      const defaultValue = 1;
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify(storedState)
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
      });

      expect(get(store)).toEqual(storedState);
    });

    it("should not replace value in local storage when same version", () => {
      const storedState = { filter: "old" };
      const defaultValue = 1n;
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify({ data: storedState, version: 5 })
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
        version: 5,
      });

      expect(get(store)).toEqual(storedState);
    });
  });

  describe("unsubscribeStorage", () => {
    it("unsubscribes storing in local storage", async () => {
      const defaultValue = { filter: "new" };
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
      });
      const newState = { filter: "old" };
      store.set(newState);
      expect(
        window.localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
      ).toEqual(JSON.stringify(newState));

      store.unsubscribeStorage();
      store.set(defaultValue);
      expect(
        window.localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
      ).toEqual(JSON.stringify(newState));
    });
  });
});
