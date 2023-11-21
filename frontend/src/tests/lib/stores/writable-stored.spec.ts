import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import { allowLoggingInOneTestForDebugging } from "$tests/utils/console.test-utils";
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

  describe("version upgrade", () => {
    it("should replace deprecated value from local storage when LS version is older", () => {
      const storedState = { filter: "old" };
      const defaultValue = { filter: "new" };
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify({ data: storedState, version: 1 })
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
        version: 2,
      });

      expect(get(store)).toEqual(defaultValue);
    });

    it("should upgrade the structure of version-less value to versioned", () => {
      const storedState = { filter: "old" };
      const defaultValue = { filter: "new" };
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify(storedState)
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
        version: 1,
      });

      expect(get(store)).toEqual(defaultValue);
      expect(
        window.localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
      ).toEqual(JSON.stringify({ data: defaultValue, version: 1 }));
    });

    it("should not replace value from local storage when it has the same version", () => {
      const storedState = { filter: "old" };
      const defaultValue = { filter: "new" };
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify({ data: storedState, version: 1 })
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue,
        version: 1,
      });

      expect(get(store)).toEqual(storedState);
    });

    it("should not remove value from local storage when no version provided", () => {
      const storedState = { filter: "old" };
      const defaultValue = { filter: "new" };
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
  });

  describe("upgradeStateVersion", () => {
    it("should upgrade data version from version-less state", () => {
      const storedState = { data: { filter: "old" } };
      const upgradedValue = { filter: "new" };
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify(storedState)
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue: {},
      });

      store.upgradeStateVersion({ newVersionValue: upgradedValue, version: 1 });

      expect(get(store)).toEqual(upgradedValue);
      expect(
        window.localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
      ).toEqual(JSON.stringify({ data: upgradedValue, version: 1 }));
    });

    it("should upgrade data version from versioned state", () => {
      const storedState = { data: { filter: "old" }, version: 0 };
      const upgradedValue = { filter: "new" };
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify(storedState)
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue: {},
      });

      store.upgradeStateVersion({ newVersionValue: upgradedValue, version: 1 });

      expect(get(store)).toEqual(upgradedValue);
      expect(
        window.localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
      ).toEqual(JSON.stringify({ data: upgradedValue, version: 1 }));
    });

    it("should skip data upgrade from less then in stored version", () => {
      // because of the error logging
      allowLoggingInOneTestForDebugging();

      const storedState = { data: { filter: "old" }, version: 2 };
      const upgradedValue = { filter: "new" };
      window.localStorage.setItem(
        StoreLocalStorageKey.ProposalFilters,
        JSON.stringify(storedState)
      );
      const store = writableStored({
        key: StoreLocalStorageKey.ProposalFilters,
        defaultValue: {},
      });

      store.upgradeStateVersion({ newVersionValue: upgradedValue, version: 1 });

      expect(get(store)).toEqual(storedState.data);
      expect(
        window.localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
      ).toEqual(JSON.stringify(storedState));
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
