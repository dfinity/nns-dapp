/**
 * @jest-environment jsdom
 */
import { get } from "svelte/store";
import { storeLocalStorageKey } from "../../../lib/constants/stores.constants";
import { writableStored } from "../../../lib/stores/writable-stored";

describe("writableStored", () => {
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("writes to local storage when state changes", () => {
    const store = writableStored({
      key: storeLocalStorageKey.ProposalFilters,
      defaultValue: { filter: "all" },
    });

    const newState = { filter: "active" };
    store.set(newState);

    expect(
      window.localStorage.getItem(storeLocalStorageKey.ProposalFilters)
    ).toEqual(JSON.stringify(newState));
  });

  it("loads initial value from local storage if present", () => {
    const storedState = { filter: "active" };
    window.localStorage.setItem(
      storeLocalStorageKey.ProposalFilters,
      JSON.stringify(storedState)
    );
    const store = writableStored({
      key: storeLocalStorageKey.ProposalFilters,
      defaultValue: { filter: "all" },
    });

    expect(get(store)).toEqual(storedState);
  });

  it("loads default value if no value in local storage", () => {
    const defaultValue = { filter: "all" };
    const store = writableStored({
      key: storeLocalStorageKey.ProposalFilters,
      defaultValue,
    });

    expect(get(store)).toEqual(defaultValue);
  });
});
