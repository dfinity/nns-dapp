import MakeNeuronsPublicForm from "$lib/modals/neurons/MakeNeuronsPublicForm.svelte";
import * as neuronsService from "$lib/services/neurons.services";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron } from "$tests/mocks/neurons.mock";
import { MakeNeuronsPublicFormPo } from "$tests/page-objects/MakeNeuronsPublicForm.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { allowLoggingInOneTestForDebugging } from "$tests/utils/console.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronType, NeuronVisibility, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("MakeNeuronsPublicForm", () => {
  const createMockNeuron = ({
    id,
    visibility,
    controller = mockMainAccount.principal.toString(),
  }: {
    id: bigint;
    visibility: NeuronVisibility;
    controller?: string;
  }): NeuronInfo =>
    ({
      neuronId: id,
      visibility,
      fullNeuron: {
        ...mockFullNeuron,
        id,
        controller,
      },
    }) as NeuronInfo;

  const privateNeuron1 = createMockNeuron({
    id: 1n,
    visibility: NeuronVisibility.Private,
  });
  const privateNeuron2 = createMockNeuron({
    id: 2n,
    visibility: NeuronVisibility.Private,
  });
  const publicNeuron1 = createMockNeuron({
    id: 3n,
    visibility: NeuronVisibility.Public,
  });
  const privateSeedNeuron = createMockNeuron({
    id: 4n,
    visibility: NeuronVisibility.Private,
  });
  privateSeedNeuron.neuronType = NeuronType.Seed;

  const uncontrolledPrivateNeuron1 = createMockNeuron({
    id: 5n,
    visibility: NeuronVisibility.Private,
    controller: "other-controller",
  });
  const uncontrolledPrivateNeuron2 = createMockNeuron({
    id: 6n,
    visibility: NeuronVisibility.Private,
    controller: "other-controller",
  });
  const hwPrivateNeuron = createMockNeuron({
    id: 7n,
    visibility: NeuronVisibility.Private,
    controller: "hardware-wallet",
  });

  let changeNeuronVisibilitySpy;

  beforeEach(() => {
    allowLoggingInOneTestForDebugging();
    vi.restoreAllMocks();
    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [],
    });
    changeNeuronVisibilitySpy = vi.spyOn(
      neuronsService,
      "changeNeuronVisibility"
    );
    neuronsStore.reset();
  });

  const renderComponent = () => {
    const mockCancel = vi.fn();

    const { container, component } = render(MakeNeuronsPublicForm);

    component.$on("nnsCancel", mockCancel);

    return {
      po: MakeNeuronsPublicFormPo.under(new JestPageObjectElement(container)),
      mockCancel,
    };
  };

  it("should initialize with no neurons selected and button disabled", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });

    const { po } = renderComponent();

    expect(await po.getConfirmButton().isDisabled()).toBe(true);
    expect(await po.getNeuronVisibilityRowPo(privateNeuron1).isPresent()).toBe(
      true
    );
    expect(await po.getNeuronVisibilityRowPo(privateNeuron2).isPresent()).toBe(
      true
    );
    expect(await po.getNeuronVisibilityRowPo(publicNeuron1).isPresent()).toBe(
      false
    );
  });

  it("should display and allow selection of private controlled neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });
    const { po } = renderComponent();

    expect(await po.getNeuronVisibilityRowPo(privateNeuron1).isPresent()).toBe(
      true
    );
    expect(await po.getNeuronVisibilityRowPo(privateNeuron2).isPresent()).toBe(
      true
    );
    expect(await po.getNeuronVisibilityRowPo(publicNeuron1).isPresent()).toBe(
      false
    );

    const checkboxPo = po
      .getNeuronVisibilityRowPo(privateNeuron1)
      .getCheckboxPo();

    await checkboxPo.click();
    expect(await po.getConfirmButton().isDisabled()).toBe(false);

    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(true);
    expect(changeNeuronVisibilitySpy).toHaveBeenCalledWith({
      neurons: [privateNeuron1],
      makePublic: true,
    });
  });

  it("should select all private neurons when 'Apply to all' is clicked", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });

    const { po } = renderComponent();

    await po.getApplyToAllCheckbox().click();
    expect(await po.getConfirmButton().isDisabled()).toBe(false);

    await po.getConfirmButton().click();

    expect(changeNeuronVisibilitySpy).toHaveBeenCalledWith({
      neurons: [privateNeuron1, privateNeuron2],
      makePublic: true,
    });
  });

  it("should update selection correctly when deselecting a neuron after 'Apply to all'", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });

    const { po } = renderComponent();

    const applyToAllCheckboxPo = po.getApplyToAllCheckbox();
    await applyToAllCheckboxPo.click();

    const checkboxPo = po
      .getNeuronVisibilityRowPo(privateNeuron2)
      .getCheckboxPo();
    await checkboxPo.click();

    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(false);
    expect(await applyToAllCheckboxPo.isChecked()).toBe(false);

    expect(changeNeuronVisibilitySpy).toHaveBeenCalledWith({
      neurons: [privateNeuron1],
      makePublic: true,
    });
  });

  it("should display correct neuron information and tags", async () => {
    neuronsStore.setNeurons({
      neurons: [
        privateNeuron1,
        privateNeuron2,
        privateSeedNeuron,
        publicNeuron1,
      ],
      certified: true,
    });

    const { po } = renderComponent();

    expect(await po.getControllableNeuronsDescription().getText()).toBe(
      "Neurons"
    );

    const privateNeuronRowPo = po.getNeuronVisibilityRowPo(privateNeuron1);
    expect(await privateNeuronRowPo.isPublic()).toBe(false);
    expect(await privateNeuronRowPo.getTags()).toEqual([]);

    const seedNeuronRowPo = po.getNeuronVisibilityRowPo(privateSeedNeuron);
    expect(await seedNeuronRowPo.getNeuronId()).toBe(
      privateSeedNeuron.neuronId.toString()
    );
    expect(await seedNeuronRowPo.isPublic()).toBe(false);
    expect(await seedNeuronRowPo.getTags()).toEqual(["Seed"]);

    expect(await po.getNeuronVisibilityRowPo(publicNeuron1).isPresent()).toBe(
      false
    );
  });

  it("should handle loading state correctly", async () => {
    neuronsStore.setNeurons({ neurons: undefined, certified: false });
    const { po } = renderComponent();

    expect(await po.getLoadingContainer().isPresent()).toBe(true);

    neuronsStore.setNeurons({ neurons: [privateNeuron1], certified: true });
    await runResolvedPromises();

    expect(await po.getLoadingContainer().isPresent()).toBe(false);
  });

  it("should show 'Apply to all' checkbox when there are more than 1 controllable private neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2],
      certified: true,
    });

    const { po } = renderComponent();

    expect(await po.getApplyToAllCheckbox().isPresent()).toBe(true);
    expect((await po.getApplyToAllCheckbox().getText()).trim()).toBe(
      "Apply to all neurons"
    );
  });

  it("disabled confirm button should be updated when a neuron is selected", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1],
      certified: true,
    });

    const { po } = renderComponent();
    expect(await po.getConfirmButton().isDisabled()).toBe(true);

    await po.getNeuronVisibilityRowPo(privateNeuron1).getCheckboxPo().click();

    expect(await po.getConfirmButton().isDisabled()).toBe(false);
  });

  it("should handle visibility of neuron lists based on neuron types", async () => {
    neuronsStore.setNeurons({
      neurons: [
        privateNeuron1,
        uncontrolledPrivateNeuron1,
        uncontrolledPrivateNeuron2,
      ],
      certified: true,
    });

    const { po } = renderComponent();

    expect(await po.getUncontrollableNeuronsList().isPresent()).toBe(true);
    expect(await po.getControllableNeuronsList().isPresent()).toBe(true);
    expect(await po.getUncontrollableNeuronsDescription().getText()).toBe(
      "These neurons have different controllers and won't be updated"
    );
  });

  it("should handle hardware wallet and hotkey uncontrolled neurons correctly", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, hwPrivateNeuron, uncontrolledPrivateNeuron1],
      certified: true,
    });

    const { po } = renderComponent();

    expect(await po.getControllableNeuronsList().isPresent()).toBe(true);
    expect(await po.getUncontrollableNeuronsList().isPresent()).toBe(true);

    expect(await po.getNeuronVisibilityRowPo(privateNeuron1).isPresent()).toBe(
      true
    );
    expect(await po.getNeuronVisibilityRowPo(hwPrivateNeuron).isPresent()).toBe(
      true
    );
    expect(
      await po.getNeuronVisibilityRowPo(uncontrolledPrivateNeuron1).isPresent()
    ).toBe(true);

    const hwPrivateNeuronRowPo = po.getNeuronVisibilityRowPo(hwPrivateNeuron);
    expect(await hwPrivateNeuronRowPo.getNeuronId()).toBe(
      hwPrivateNeuron.neuronId.toString()
    );
    expect(await hwPrivateNeuronRowPo.isPublic()).toBe(false);
  });

  it("should not allow selection of uncontrolled neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, uncontrolledPrivateNeuron1],
      certified: true,
    });

    const { po } = renderComponent();

    const controllableCheckboxPo = po
      .getNeuronVisibilityRowPo(privateNeuron1)
      .getCheckboxPo();
    const uncontrollableCheckboxPo = po
      .getNeuronVisibilityRowPo(uncontrolledPrivateNeuron1)
      .getCheckboxPo();

    expect(await controllableCheckboxPo.isDisabled()).toBe(false);
    expect(await uncontrollableCheckboxPo.isDisabled()).toBe(true);

    await controllableCheckboxPo.click();
    await po.getConfirmButton().click();

    expect(changeNeuronVisibilitySpy).toHaveBeenCalledWith({
      neurons: [privateNeuron1],
      makePublic: true,
    });
  });
});
