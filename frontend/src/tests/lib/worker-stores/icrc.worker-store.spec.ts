import {
  IcrcWorkerStore,
  type IcrcWorkerData,
} from "$lib/worker-stores/icrc.worker-store";

describe("icrc.worker-store", () => {
  interface TestData extends IcrcWorkerData {
    test: string;
  }

  let store: IcrcWorkerStore<TestData>;

  beforeEach(() => (store = new IcrcWorkerStore<TestData>()));

  it("should be empty per default", () => {
    expect(Object.keys(store.state)).toHaveLength(0);
  });

  it("should update store", () => {
    const data1 = { accountIdentifier: "1", certified: false, test: "test" };
    store.update([data1]);
    expect(store.state).toEqual({
      [data1.accountIdentifier]: data1,
    });

    const data2 = { accountIdentifier: "1", certified: false, test: "test" };
    store.update([data2]);
    expect(store.state).toEqual({
      [data1.accountIdentifier]: data1,
      [data2.accountIdentifier]: data2,
    });

    store.update([data1]);
    expect(store.state).toEqual({
      [data1.accountIdentifier]: data1,
      [data2.accountIdentifier]: data2,
    });

    store.update([{ ...data1, test: "testtest" }]);
    expect(store.state).not.toEqual({
      [data1.accountIdentifier]: { ...data1, test: "testtest" },
      [data2.accountIdentifier]: data2,
    });
  });

  it("should reset store", () => {
    const data1 = { accountIdentifier: "1", certified: false, test: "test" };
    store.update([data1]);
    expect(Object.keys(store.state)).toHaveLength(1);

    store.reset();
    expect(Object.keys(store.state)).toHaveLength(0);

    store.update([data1, { ...data1, accountIdentifier: "2" }]);
    expect(Object.keys(store.state)).toHaveLength(2);

    store.reset();
    expect(Object.keys(store.state)).toHaveLength(0);
  });
});
