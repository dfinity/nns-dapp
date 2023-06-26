import { syncOverallStatusStore } from "$lib/derived/sync.derived";
import { syncStore } from "$lib/stores/sync.store";
import { get } from "svelte/store";

describe("sync.derived", () => {
  beforeEach(() => syncStore.reset());

  it("should be idle per default", () => {
    const store = get(syncOverallStatusStore);
    expect(store).toEqual("idle");
  });

  it("should be in_progress", () => {
    syncStore.setState({
      key: "balances",
      state: "in_progress",
    });

    const store = get(syncOverallStatusStore);
    expect(store).toEqual("in_progress");

    syncStore.setState({
      key: "transactions",
      state: "in_progress",
    });

    const store1 = get(syncOverallStatusStore);
    expect(store1).toEqual("in_progress");

    syncStore.setState({
      key: "balances",
      state: "idle",
    });

    const store2 = get(syncOverallStatusStore);
    expect(store2).toEqual("in_progress");

    syncStore.setState({
      key: "transactions",
      state: "idle",
    });

    const store3 = get(syncOverallStatusStore);
    expect(store3).toEqual("idle");
  });

  it("should be error", () => {
    syncStore.setState({
      key: "balances",
      state: "error",
    });

    const store = get(syncOverallStatusStore);
    expect(store).toEqual("error");

    syncStore.setState({
      key: "transactions",
      state: "error",
    });

    const store1 = get(syncOverallStatusStore);
    expect(store1).toEqual("error");

    syncStore.setState({
      key: "balances",
      state: "in_progress",
    });

    const store2 = get(syncOverallStatusStore);
    expect(store2).toEqual("error");

    syncStore.setState({
      key: "balances",
      state: "idle",
    });

    const store3 = get(syncOverallStatusStore);
    expect(store3).toEqual("error");

    syncStore.setState({
      key: "transactions",
      state: "idle",
    });

    const store4 = get(syncOverallStatusStore);
    expect(store4).toEqual("idle");
  });
});
