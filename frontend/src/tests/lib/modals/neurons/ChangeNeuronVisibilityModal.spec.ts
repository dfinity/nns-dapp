import * as api from "$lib/api/governance.api";
import ChangeNeuronVisibilityModal from "$lib/modals/neurons/ChangeNeuronVisibilityModal.svelte";
import * as neuronsService from "$lib/services/neurons.services";
import * as busyServices from "$lib/stores/busy.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { ChangeNeuronVisibilityModalPo } from "$tests/page-objects/ChangeNeuronVisibilityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { NeuronVisibility } from "@dfinity/nns";
import { get } from "svelte/store";

vi.mock("$lib/api/governance.api");

describe("ChangeNeuronVisibilityModal", () => {
  let spyConsoleError;
  let changeNeuronVisibilitySpy;
  let queryNeuronSpy;

  const publicNeuron = {
    ...mockNeuron,
    neuronId: 1n,
    visibility: NeuronVisibility.Public,
    fullNeuron: {
      ...mockFullNeuron,
      id: 1n,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  const publicNeuronWithUpdatedVisibility = {
    ...publicNeuron,
    visibility: NeuronVisibility.Private,
  };

  const privateNeuron = {
    ...mockNeuron,
    neuronId: 2n,
    visibility: NeuronVisibility.Private,
    fullNeuron: {
      ...mockFullNeuron,
      id: 2n,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  const privateNeuronWithUpdatedVisibility = {
    ...privateNeuron,
    visibility: NeuronVisibility.Public,
  };

  beforeEach(() => {
    resetIdentity();
    neuronsStore.reset();
    toastsStore.reset();
    spyConsoleError?.mockRestore();
    changeNeuronVisibilitySpy?.mockRestore();
    queryNeuronSpy?.mockRestore();
    spyConsoleError = vi.spyOn(console, "error");
    changeNeuronVisibilitySpy = vi.spyOn(
      neuronsService,
      "changeNeuronVisibility"
    );
    queryNeuronSpy = vi.spyOn(api, "queryNeuron");
    neuronsStore.pushNeurons({
      neurons: [publicNeuron, privateNeuron],
      certified: true,
    });
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

  it("should display modal", async () => {
    const { po } = await renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should display correct title for making neuron private", async () => {
    const { po } = await renderComponent(publicNeuron);

    expect(await po.getModalTitle()).toBe("Make Neuron Private");
  });

  it("should display correct title for making neuron public", async () => {
    const { po } = await renderComponent(privateNeuron);

    expect(await po.getModalTitle()).toBe("Make Neuron Public");
  });

  it("should call changeNeuronVisibility with correct values for privateNeurons on confirm click", async () => {
    queryNeuronSpy.mockResolvedValue(privateNeuronWithUpdatedVisibility);

    const { po } = await renderComponent(privateNeuron);

    const confirmButton = po
      .getChangeBulkNeuronVisibilityFormPo()
      .getConfirmButton();

    await confirmButton.click();

    expect(changeNeuronVisibilitySpy).toHaveBeenCalledWith({
      neurons: [privateNeuron],
      makePublic: true,
    });
  });

  it("should call changeNeuronVisibility with correct values for publicNeurons on confirm click", async () => {
    queryNeuronSpy.mockResolvedValue(publicNeuronWithUpdatedVisibility);

    const { po } = await renderComponent(publicNeuron);

    const confirmButton = po
      .getChangeBulkNeuronVisibilityFormPo()
      .getConfirmButton();

    await confirmButton.click();

    expect(changeNeuronVisibilitySpy).toHaveBeenCalledWith({
      neurons: [publicNeuron],
      makePublic: false,
    });
  });

  it("should start and stop busy indicator when changing visibility", async () => {
    queryNeuronSpy.mockResolvedValue(privateNeuronWithUpdatedVisibility);

    const { po } = await renderComponent(privateNeuron);

    const confirmButton = po
      .getChangeBulkNeuronVisibilityFormPo()
      .getConfirmButton();

    await confirmButton.click();

    expect(startBusySpy).toHaveBeenCalledWith({
      initiator: "change-neuron-visibility",
      labelKey: "neuron_detail.change_neuron_visibility_loading",
    });

    await runResolvedPromises();
    expect(stopBusySpy).toHaveBeenCalledWith("change-neuron-visibility");
  });

  it("should show success toast and close modal after successful visibility change for private neuron", async () => {
    queryNeuronSpy.mockResolvedValue(privateNeuronWithUpdatedVisibility);
    const { po, nnsClose } = await renderComponent(privateNeuron);

    const confirmButton = po
      .getChangeBulkNeuronVisibilityFormPo()
      .getConfirmButton();

    await confirmButton.click();

    await runResolvedPromises();

    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "Visibility updated to public successfully.",
      },
    ]);
    expect(nnsClose).toHaveBeenCalled();
  });

  it("should show success toast and close modal after successful visibility change for public neuron", async () => {
    queryNeuronSpy.mockResolvedValue(publicNeuronWithUpdatedVisibility);

    const { po, nnsClose } = await renderComponent(publicNeuron);

    const confirmButton = po
      .getChangeBulkNeuronVisibilityFormPo()
      .getConfirmButton();

    await confirmButton.click();

    await runResolvedPromises();

    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "Visibility updated to private successfully.",
      },
    ]);
    expect(nnsClose).toHaveBeenCalled();
  });

  it("should handle error when changing neuron visibility", async () => {
    spyConsoleError.mockReturnValue();

    const { po } = await renderComponent();

    const confirmButton = po
      .getChangeBulkNeuronVisibilityFormPo()
      .getConfirmButton();

    await confirmButton.click();

    await runResolvedPromises();

    expect(spyConsoleError).toHaveBeenCalledWith(
      "Error changing neuron visibility"
    );
  });
});
