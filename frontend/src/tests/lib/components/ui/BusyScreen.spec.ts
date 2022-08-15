/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import BusyScreen from "../../../../lib/components/ui/BusyScreen.svelte";
import { startBusy, stopBusy } from "../../../../lib/stores/busy.store";

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
