import ChangeNeuronVisibilityModal from "$lib/modals/neurons/ChangeNeuronVisibilityModal.svelte";
import { changeNeuronVisibility } from "$lib/services/neurons.services";
import * as busyServices from "$lib/stores/busy.store";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronVisibility } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    changeNeuronVisibility: vi.fn().mockResolvedValue(undefined),
  };
});

describe("ChangeNeuronVisibilityModal", () => {
  const startBusySpy = vi.spyOn(busyServices, "startBusy");
  const stopBusySpy = vi.spyOn(busyServices, "stopBusy");

  const renderChangeNeuronVisibilityModal = async (
    neuron = mockNeuron
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: ChangeNeuronVisibilityModal,
      props: { neuron },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display modal", async () => {
    const { container } = await renderChangeNeuronVisibilityModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display correct title for making neuron private", async () => {
    const publicNeuron = { ...mockNeuron, visibility: NeuronVisibility.Public };
    const { getByText } = await renderChangeNeuronVisibilityModal(publicNeuron);

    expect(getByText("Make Neuron Private")).toBeInTheDocument();
  });

  it("should display correct title for making neuron public", async () => {
    const privateNeuron = {
      ...mockNeuron,
      visibility: NeuronVisibility.Private,
    };
    const { getByText } =
      await renderChangeNeuronVisibilityModal(privateNeuron);

    expect(getByText("Make Neuron Public")).toBeInTheDocument();
  });

  it("should have a disabled checkbox for applying to all neurons", async () => {
    const { getByLabelText } = await renderChangeNeuronVisibilityModal();

    const checkbox = getByLabelText("Apply to all neurons");
    expect(checkbox).toBeDisabled();
  });

  it("should call changeNeuronVisibility service on confirm click", async () => {
    const { getByText } = await renderChangeNeuronVisibilityModal();

    const confirmButton = getByText("Confirm");
    await fireEvent.click(confirmButton);

    expect(changeNeuronVisibility).toHaveBeenCalledWith({
      neurons: [mockNeuron],
      makePublic: true,
    });
  });

  it("should start and stop busy indicator when changing visibility", async () => {
    const { getByText } = await renderChangeNeuronVisibilityModal();

    const confirmButton = getByText("Confirm");
    await fireEvent.click(confirmButton);

    expect(startBusySpy).toHaveBeenCalledWith({
      initiator: "change-neuron-visibility",
      labelKey: "neuron_detail.change_neuron_make_neuron_public",
    });

    await waitFor(() => {
      expect(stopBusySpy).toHaveBeenCalledWith("change-neuron-visibility");
    });
  });

  it("should close modal after successful visibility change", async () => {
    const { getByText, component } = await renderChangeNeuronVisibilityModal();

    const onClose = vi.fn();
    component.$on("nnsClose", onClose);

    const confirmButton = getByText("Confirm");
    await fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("should handle error when changing neuron visibility", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(changeNeuronVisibility).mockRejectedValueOnce(
      new Error("Test error")
    );

    const { getByText } = await renderChangeNeuronVisibilityModal();

    const confirmButton = getByText("Confirm");
    await fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error changing neuron visibility:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
