/**
 * @jest-environment jsdom
 */

import LayoutList from "$lib/components/layout/LayoutList.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { BREAKPOINT_LARGE } from "@dfinity/gix-components";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("LayoutList", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  describe("when innerWidth is less than breakpoint large", () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).innerWidth = BREAKPOINT_LARGE - 10;
    });

    it("should set title and header to the prop title", () => {
      const testTitle = "Test title";
      render(LayoutList, {
        props: {
          title: testTitle,
        },
      });

      expect(get(layoutTitleStore)).toEqual({
        title: testTitle,
        header: testTitle,
      });
    });

    it("should not set header to the prop title if showHeader prop is false", () => {
      const testTitle = "Test title";
      render(LayoutList, {
        props: {
          title: testTitle,
          showHeader: false,
        },
      });

      expect(get(layoutTitleStore).header).toBe("");
    });

    describe("when innerWidth is more than breakpoint large", () => {
      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).innerWidth = BREAKPOINT_LARGE + 10;
      });

      it("should set title but not the header to the prop title", () => {
        const testTitle = "Test title";
        render(LayoutList, {
          props: {
            title: testTitle,
          },
        });

        expect(get(layoutTitleStore)).toEqual({
          title: testTitle,
          header: "",
        });
      });
    });
  });
});
