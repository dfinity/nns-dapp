/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import BusyScreen from "../../../../lib/components/ui/BusyScreen.svelte";
import { busyStore } from "../../../../lib/stores/busy.store";

describe("BusyScreen", () => {
  it("should show the spinner", async () => {
    const { container } = render(BusyScreen);
    busyStore.start("test");
    await waitFor(() =>
      expect(container.querySelector("svg")).toBeInTheDocument()
    );
  });

  it("should hide the spinner", async () => {
    const { container } = render(BusyScreen);
    busyStore.start("test");
    await waitFor(() =>
      expect(container.querySelector("svg")).toBeInTheDocument()
    );
    busyStore.stop("test");
    await waitFor(() =>
      expect(container.querySelector("svg")).not.toBeInTheDocument()
    );
  });
});
