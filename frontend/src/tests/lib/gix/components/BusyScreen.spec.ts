import BusyScreen from "$lib/gix/components/BusyScreen.svelte";
import { busyStore, startBusy } from "$lib/gix/stores/busy.store";
import { render, waitFor } from "@testing-library/svelte";

describe("BusyScreen", () => {
  beforeEach(() => busyStore.resetForTesting());

  it("should show the spinner", async () => {
    const { container } = render(BusyScreen);
    startBusy({ initiator: "stake-neuron" });
    await waitFor(() =>
      expect(container.querySelector("svg")).toBeInTheDocument()
    );
  });
});
