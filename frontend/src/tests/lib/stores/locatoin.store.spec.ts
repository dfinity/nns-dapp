import { locationStore } from "$lib/stores/location.store";
import { get } from "svelte/store";

describe("LocationStore", () => {
  beforeEach(() => {
    locationStore.set(undefined);
  });
  it("should set the location store", () => {
    locationStore.set("CH");
    expect(get(locationStore)).toEqual("CH");

    locationStore.set("US");
    expect(get(locationStore)).toEqual("US");
  });
});
