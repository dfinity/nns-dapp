import * as api from "$lib/api/governance.api";
import MakeNeuronsPublicModal from "$lib/modals/neurons/MakeNeuronsPublicModal.svelte";
import * as neuronsService from "$lib/services/neurons.services";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { MakeNeuronsPublicModalPo } from "$tests/page-objects/MakeNeuronsPublicModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { NeuronVisibility, type NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { vi } from "vitest";

vi.mock("$lib/api/governance.api");

describe("MakeNeuronsPublicModal", () => {
  const privateNeuron: NeuronInfo = {
    ...mockNeuron,
    visibility: NeuronVisibility.Private,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const privateNeuron2: NeuronInfo = {
    ...mockNeuron,
    neuronId: 2n,
    visibility: NeuronVisibility.Private,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      id: 2n,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  let changeNeuronVisibilitySpy;
  let queryNeuronSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    resetIdentity();
    neuronsStore.reset();
    toastsStore.reset();
    queryNeuronSpy?.mockRestore();
    neuronsStore.setNeurons({
      neurons: [privateNeuron, privateNeuron2],
      certified: true,
    });
    queryNeuronSpy = vi.spyOn(api, "queryNeuron");
    changeNeuronVisibilitySpy = vi.spyOn(
      neuronsService,
      "changeNeuronVisibility"
    );
  });

  const renderComponent = async () => {
    const { container, component } = await renderModal({
      component: MakeNeuronsPublicModal,
    });

    const nnsClose = vi.fn();
    component.$on("nnsClose", nnsClose);

    return {
      po: MakeNeuronsPublicModalPo.under(new JestPageObjectElement(container)),
      nnsClose,
    };
  };

  it("should display modal", async () => {
    const { po } = await renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should display correct title for making neuron public", async () => {
    const { po } = await renderComponent();

    expect(await po.getModalTitle()).toBe("Make Neuron Public");
  });

  it("should call changeNeuronVisibility with correct values for privateNeurons on confirm click", async () => {
    queryNeuronSpy.mockResolvedValue({
      ...privateNeuron,
      visibility: NeuronVisibility.Public,
    });

    const { po } = await renderComponent();

    const confirmButton = po.getMakeNeuronsPublicFormPo().getConfirmButton();

    await po
      .getMakeNeuronsPublicFormPo()
      .getNeuronVisibilityRowPo(privateNeuron)
      .getCheckboxPo()
      .click();

    await confirmButton.click();

    expect(changeNeuronVisibilitySpy).toHaveBeenCalledWith({
      neurons: [privateNeuron],
      makePublic: true,
    });
  });

  it("should show success toast and close modal after successful visibility change for private neuron", async () => {
    queryNeuronSpy.mockResolvedValue({
      ...privateNeuron,
      visibility: NeuronVisibility.Public,
    });

    const { po, nnsClose } = await renderComponent();

    await po
      .getMakeNeuronsPublicFormPo()
      .getNeuronVisibilityRowPo(privateNeuron)
      .getCheckboxPo()
      .click();

    await po.getMakeNeuronsPublicFormPo().getConfirmButton().click();

    await runResolvedPromises();

    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "Visibility updated to public successfully.",
      },
    ]);

    expect(nnsClose).toHaveBeenCalled();
  });
});
