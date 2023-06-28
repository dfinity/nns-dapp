import { syncStore } from "$lib/stores/sync.store";
import { get } from "svelte/store";

describe("sync.store", () => {
  beforeEach(() => syncStore.reset());

  const data = {
    balances: "idle",
    transactions: "idle",
  };

  it("should set sync status", () => {
    syncStore.setState({
      key: "balances",
      state: "in_progress",
    });

    const store = get(syncStore);

    expect(store).toEqual({
      ...data,
      balances: "in_progress",
    });

    syncStore.setState({
      key: "transactions",
      state: "in_progress",
    });

    const store1 = get(syncStore);

    expect(store1).toEqual({
      ...data,
      balances: "in_progress",
      transactions: "in_progress",
    });

    syncStore.setState({
      key: "balances",
      state: "idle",
    });

    const store2 = get(syncStore);

    expect(store2).toEqual({
      ...data,
      transactions: "in_progress",
    });
  });

  it("should be idle per default", () => {
    const store = get(syncStore);
    expect(store).toEqual(data);
  });
});
