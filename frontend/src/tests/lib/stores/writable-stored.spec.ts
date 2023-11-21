import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import { get } from "svelte/store";

describe("writableStored", () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("writes to local storage when state changes", () => {
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue: { filter: "all" },
    });

    const newState = { filter: "active" };
    store.set(newState);

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.ProposalFilters)
    ).toEqual(JSON.stringify(newState));
  });

  it("loads initial value from local storage if present", () => {
    const storedState = { filter: "active" };
    window.localStorage.setItem(
      StoreLocalStorageKey.ProposalFilters,
      JSON.stringify(storedState)
    );
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue: { filter: "all" },
    });

    expect(get(store)).toEqual(storedState);
  });

  it("loads default value if no value in local storage", () => {
    const defaultValue = { filter: "all" };
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue,
    });

    expect(get(store)).toEqual(defaultValue);
  });

  it("remove deprecated value from local storage when LS version is older", () => {
    const storedState = { filter: "active", version: 1 };
    const defaultValue = { filter: "all", version: 2 };
    window.localStorage.setItem(
      StoreLocalStorageKey.ProposalFilters,
      JSON.stringify(storedState)
    );
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue,
    });

    expect(get(store)).toEqual(defaultValue);
  });

  it("remove value from local storage when LS has no version", () => {
    const storedState = { filter: "active" };
    const defaultValue = { filter: "all", version: 1 };
    window.localStorage.setItem(
      StoreLocalStorageKey.ProposalFilters,
      JSON.stringify(storedState)
    );
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue,
    });

    expect(get(store)).toEqual(defaultValue);
  });

  it("should not remove value from local storage when LS has same version", () => {
    const storedState = { filter: "active", version: 1 };
    const defaultValue = { filter: "all", version: 1 };
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

  it("should not remove value from local storage when no version in LS and defauldValue", () => {
    const storedState = { filter: "active" };
    const defaultValue = { filter: "all" };
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

  it("unsubscribes storing in local storage", async () => {
    const defaultValue = { filter: "all" };
    const store = writableStored({
      key: StoreLocalStorageKey.ProposalFilters,
      defaultValue,
    });
    const newState = { filter: "active" };
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
