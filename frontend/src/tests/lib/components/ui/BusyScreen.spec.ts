/**
 * @jest-environment jsdom
 */

import BusyScreen from "$lib/components/ui/BusyScreen.svelte";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { render, waitFor } from "@testing-library/svelte";

describe("BusyScreen", () => {
  it("should show the spinner", async () => {
    const { container } = render(BusyScreen);
    startBusy({ initiator: "stake-neuron" });
    await waitFor(() =>
      expect(container.querySelector("svg")).toBeInTheDocument()
    );
  });

  it("should hide the spinner", async () => {
    const { container } = render(BusyScreen);
    startBusy({ initiator: "stake-neuron" });
    await waitFor(() =>
      expect(container.querySelector("svg")).toBeInTheDocument()
    );
    stopBusy("stake-neuron");
    await waitFor(() =>
      expect(container.querySelector("svg")).not.toBeInTheDocument()
    );
  });
});
