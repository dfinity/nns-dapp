import { queuedStore } from "$lib/stores/queued-store";
import { get } from "svelte/store";

describe("queuedStore", () => {
  it("should expose initial data", () => {
    const store = queuedStore("foo");
    expect(get(store)).toEqual("foo");
  });

  it("should set data", () => {
    const store = queuedStore("foo");
    const { set } = store.getSingleMutationStore();
    expect(get(store)).toEqual("foo");
    set({ data: "bar", certified: true });
    expect(get(store)).toEqual("bar");
  });

  it("should update data", () => {
    const store = queuedStore("Hello, ");
    const { update } = store.getSingleMutationStore();
    expect(get(store)).toEqual("Hello, ");
    update({ mutation: (s) => s + "world!", certified: true });
    expect(get(store)).toEqual("Hello, world!");
  });

  it("should replace updates from the same single mutation store", () => {
    const store = queuedStore("Hello, ");
    const { update } = store.getSingleMutationStore();
    expect(get(store)).toEqual("Hello, ");
    update({ mutation: (s) => s + "world!", certified: false });
    expect(get(store)).toEqual("Hello, world!");
    update({ mutation: (s) => s + "everybody!", certified: true });
    expect(get(store)).toEqual("Hello, everybody!");
  });

  it("set out of order should not set stale data", () => {
    const oldData = "old data";
    const newData = "new data";
    const store = queuedStore("");

    const { set: set1 } = store.getSingleMutationStore();
    set1({ data: oldData, certified: false });
    expect(get(store)).toEqual(oldData);

    const { set: set2 } = store.getSingleMutationStore();
    set2({ data: newData, certified: false });
    expect(get(store)).toEqual(newData);

    set2({ data: newData, certified: true });
    expect(get(store)).toEqual(newData);

    set1({ data: oldData, certified: true });
    expect(get(store)).toEqual(newData);
  });

  it("should apply multiple mutations in the original order", () => {
    const store = queuedStore("");
    const { set } = store.getSingleMutationStore();
    set({ data: "Hello, ", certified: false });
    expect(get(store)).toEqual("Hello, ");

    const { update } = store.getSingleMutationStore();
    update({ mutation: (s) => s + "world!", certified: false });
    expect(get(store)).toEqual("Hello, world!");

    set({ data: "Goodbye, ", certified: true });
    expect(get(store)).toEqual("Goodbye, world!");

    update({ mutation: (s) => s + "everybody!", certified: true });
    expect(get(store)).toEqual("Goodbye, everybody!");
  });

  it("can cancel a mutation", () => {
    const store = queuedStore("");
    const { set, cancel } = store.getSingleMutationStore();
    cancel();
    const setAfterCancel = () => set({ data: "foo", certified: false });
    expect(setAfterCancel).toThrowError("No entry found for this mutation");
  });

  it("should fail to apply a mutation that's already finalized", () => {
    const store = queuedStore("foo");
    const { set } = store.getSingleMutationStore();
    set({ data: "bar", certified: true });
    const secondSet = () => set({ data: "beep", certified: true });
    expect(secondSet).toThrowError("No entry found for this mutation");
  });

  it("should fail to apply the same non-certified mutation twice", () => {
    const store = queuedStore("foo");
    const { set } = store.getSingleMutationStore();
    set({ data: "bar", certified: false });
    const secondSet = () => set({ data: "beep", certified: false });
    expect(secondSet).toThrowError(
      "We already have a nonCertifiedMutation for this entry"
    );
  });

  it("should fail to apply the same certified mutation twice", () => {
    const store = queuedStore("foo");
    // We need to put a non-certified mutation in front of the certified
    // mutation or the certified mutation will immediately finalize.
    const { set: set1 } = store.getSingleMutationStore();
    set1({ data: "bar", certified: false });

    const { set: set2 } = store.getSingleMutationStore();
    set2({ data: "beep", certified: true });
    const secondSet = () => set2({ data: "bloop", certified: true });
    expect(secondSet).toThrowError(
      "We already have a certifiedMutation for this entry"
    );
  });

  it("should finalize a mutation on query response with 'query' strategy", () => {
    const store = queuedStore("foo");
    const { set } = store.getSingleMutationStore("query");
    set({ data: "bar", certified: false });
    const secondSet = () => set({ data: "beep", certified: true });
    expect(secondSet).toThrowError("No entry found for this mutation");
  });
});
