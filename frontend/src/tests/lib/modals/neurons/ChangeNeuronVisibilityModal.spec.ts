import ChangeNeuronVisibilityModal from "$lib/modals/neurons/ChangeNeuronVisibilityModal.svelte";
import { changeNeuronVisibility } from "$lib/services/neurons.services";
import * as busyServices from "$lib/stores/busy.store";
import { toastsSuccess } from "$lib/stores/toasts.store";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ChangeNeuronVisibilityModalPo } from "$tests/page-objects/ChangeNeuronVisibilityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronVisibility } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/neurons.services", () => ({
  changeNeuronVisibility: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("$lib/stores/toasts.store", () => ({
  toastsSuccess: vi.fn(),
}));

let spyConsoleError;

describe("ChangeNeuronVisibilityModal", () => {
  beforeEach(() => {
    spyConsoleError = vi.spyOn(console, "error");
  });
  afterEach(() => {
    spyConsoleError?.mockRestore();
  });
  const startBusySpy = vi.spyOn(busyServices, "startBusy");
  const stopBusySpy = vi.spyOn(busyServices, "stopBusy");

  const renderComponent = async (neuron = mockNeuron) => {
    const { container, component } = await renderModal({
      component: ChangeNeuronVisibilityModal,
      props: { neuron },
    });

    const nnsClose = vi.fn();
    component.$on("nnsClose", nnsClose);

    return {
      po: ChangeNeuronVisibilityModalPo.under(
        new JestPageObjectElement(container)
      ),
      nnsClose,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display modal", async () => {
    const { po } = await renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should display correct title for making neuron private", async () => {
    const publicNeuron = { ...mockNeuron, visibility: NeuronVisibility.Public };
    const { po } = await renderComponent(publicNeuron);

    expect(await po.getModalTitle()).toBe("Make Neuron Private");
  });

  it("should display correct title for making neuron public", async () => {
    const privateNeuron = {
      ...mockNeuron,
      visibility: NeuronVisibility.Private,
    };
    const { po } = await renderComponent(privateNeuron);

    expect(await po.getModalTitle()).toBe("Make Neuron Public");
  });

  it("should call changeNeuronVisibility service on confirm click", async () => {
    const { po } = await renderComponent();

    const confirmButton = po.getConfirmButton();

    await confirmButton.click();

    expect(changeNeuronVisibility).toHaveBeenCalledWith({
      neurons: [mockNeuron],
      makePublic: true,
    });
  });

  it("should start and stop busy indicator when changing visibility", async () => {
    const { po } = await renderComponent();

    const confirmButton = po.getConfirmButton();

    await confirmButton.click();

    expect(startBusySpy).toHaveBeenCalledWith({
      initiator: "change-neuron-visibility",
      labelKey: "neuron_detail.change_neuron_visibility_loading",
    });

    await waitFor(() => {
      expect(stopBusySpy).toHaveBeenCalledWith("change-neuron-visibility");
    });
  });

  it("should show success toast and close modal after successful visibility change for private neuron", async () => {
    const privateNeuron = {
      ...mockNeuron,
      visibility: NeuronVisibility.Private,
    };

    const { po, nnsClose } = await renderComponent(privateNeuron);

    const confirmButton = po.getConfirmButton();

    await confirmButton.click();

    await waitFor(() => {
      expect(toastsSuccess).toHaveBeenCalledWith({
        labelKey: "neuron_detail.change_neuron_public_success",
      });
      expect(nnsClose).toHaveBeenCalled();
    });
  });

  it("should show success toast and close modal after successful visibility change for public neuron", async () => {
    const publicNeuron = { ...mockNeuron, visibility: NeuronVisibility.Public };

    const { po, nnsClose } = await renderComponent(publicNeuron);

    const confirmButton = po.getConfirmButton();

    await confirmButton.click();

    await waitFor(() => {
      expect(toastsSuccess).toHaveBeenCalledWith({
        labelKey: "neuron_detail.change_neuron_private_success",
      });
      expect(nnsClose).toHaveBeenCalled();
    });
  });

  it("should handle error when changing neuron visibility", async () => {
    spyConsoleError.mockReturnValue();
    vi.mocked(changeNeuronVisibility).mockResolvedValueOnce({ success: false });

    const { po } = await renderComponent();

    const confirmButton = po.getConfirmButton();

    await confirmButton.click();

    await waitFor(() => {
      expect(spyConsoleError).toHaveBeenCalledWith(
        "Error changing neuron visibility"
      );
    });
  });
});
