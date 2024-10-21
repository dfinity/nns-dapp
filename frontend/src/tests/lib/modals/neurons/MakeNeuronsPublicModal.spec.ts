import MakeNeuronsPublicModal from "$lib/modals/neurons/MakeNeuronsPublicModal.svelte";
import * as neuronsService from "$lib/services/neurons.services";
import { neuronsStore } from "$lib/stores/neurons.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { MakeNeuronsPublicModalPo } from "$tests/page-objects/MakeNeuronsPublicModal.page-object";
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
      ...mockFullNeuron,
      controller: mockMainAccount.principal.toString(),
    },
  };

  let changeNeuronVisibilitySpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    resetIdentity();
    neuronsStore.reset();
    toastsStore.reset();
    neuronsStore.setNeurons({
      neurons: [privateNeuron],
      certified: true,
    });
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
    changeNeuronVisibilitySpy.mockResolvedValue(undefined);
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
