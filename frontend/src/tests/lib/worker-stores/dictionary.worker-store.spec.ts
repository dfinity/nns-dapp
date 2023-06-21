import {
  DictionaryWorkerStore,
  type DictionaryWorkerData,
} from "$lib/worker-stores/dictionary.worker-store";

describe("dictionary.worker-store", () => {
  interface TestData extends DictionaryWorkerData {
    test: string;
  }

  let store: DictionaryWorkerStore<TestData>;

  beforeEach(() => (store = new DictionaryWorkerStore<TestData>()));

  it("should be empty per default", () => {
    expect(Object.keys(store.state)).toHaveLength(0);
  });

  it("should update store", () => {
    const data1 = { key: "1", certified: false, test: "test" };
    store.update([data1]);
    expect(store.state).toEqual({
      [data1.key]: data1,
    });

    const data2 = { key: "1", certified: false, test: "test" };
    store.update([data2]);
    expect(store.state).toEqual({
      [data1.key]: data1,
      [data2.key]: data2,
    });

    store.update([data1]);
    expect(store.state).toEqual({
      [data1.key]: data1,
      [data2.key]: data2,
    });

    store.update([{ ...data1, test: "testtest" }]);
    expect(store.state).not.toEqual({
      [data1.key]: { ...data1, test: "testtest" },
      [data2.key]: data2,
    });
  });

  it("should reset store", () => {
    const data1 = { key: "1", certified: false, test: "test" };
    store.update([data1]);
    expect(Object.keys(store.state)).toHaveLength(1);

    store.reset();
    expect(Object.keys(store.state)).toHaveLength(0);

    store.update([data1, { ...data1, key: "2" }]);
    expect(Object.keys(store.state)).toHaveLength(2);

    store.reset();
    expect(Object.keys(store.state)).toHaveLength(0);
  });
});
