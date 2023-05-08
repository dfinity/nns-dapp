import { userCountryStore } from "$lib/stores/user-country.store";
import { get } from "svelte/store";

describe("userCountryStore", () => {
  beforeEach(() => {
    userCountryStore.set(undefined);
  });
  it("should set the location store", () => {
    userCountryStore.set("CH");
    expect(get(userCountryStore)).toEqual("CH");

    userCountryStore.set("US");
    expect(get(userCountryStore)).toEqual("US");
  });
});
