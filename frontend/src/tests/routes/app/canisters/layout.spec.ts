/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import CanistersLayout from "$routes/(app)/(nns)/canisters/+layout.svelte";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Canisters layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  describe("when use is logged in", () => {
    beforeEach(() => {
      authStore.setForTesting(mockIdentity);
    });

    it("should set title and header layout to Canisters text", () => {
      render(CanistersLayout);

      expect(get(layoutTitleStore)).toEqual({
        title: "My Canisters",
        header: "My Canisters",
      });
    });
  });

  describe("when use is not logged in", () => {
    beforeEach(() => {
      authStore.setForTesting(null);
    });

    it("should set title but not header layout to Canisters text", () => {
      render(CanistersLayout);

      expect(get(layoutTitleStore)).toEqual({
        title: "My Canisters",
        header: "",
      });
    });
  });
});
