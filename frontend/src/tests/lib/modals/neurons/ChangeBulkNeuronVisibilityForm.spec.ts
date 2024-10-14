import ChangeBulkNeuronVisibilityForm from "$lib/modals/neurons/ChangeBulkNeuronVisibilityForm.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron } from "$tests/mocks/neurons.mock";
import { ChangeBulkNeuronVisibilityFormPo } from "$tests/page-objects/ChangeBulkNeuronVisibilityForm.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { allowLoggingInOneTestForDebugging } from "$tests/utils/console.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronType, NeuronVisibility, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("ChangeBulkNeuronVisibilityForm", () => {
  const createMockNeuron = (
    id: bigint,
    visibility: NeuronVisibility,
    controller: string = mockMainAccount.principal.toString()
  ): NeuronInfo =>
    ({
      neuronId: id,
      visibility,
      fullNeuron: {
        ...mockFullNeuron,
        id,
        controller,
      },
    }) as NeuronInfo;

  const publicNeuron1 = createMockNeuron(1n, NeuronVisibility.Public);
  const publicNeuron2 = createMockNeuron(2n, NeuronVisibility.Public);
  const privateNeuron1 = createMockNeuron(3n, NeuronVisibility.Private);
  const publicSeedNeuron = createMockNeuron(9n, NeuronVisibility.Public);
  publicSeedNeuron.neuronType = NeuronType.Seed;

  const uncontrolledPublicNeuron1 = createMockNeuron(
    5n,
    NeuronVisibility.Public,
    "other-controller"
  );
  const uncontrolledPrivateNeuron2 = createMockNeuron(
    6n,
    NeuronVisibility.Private,
    "other-controller"
  );
  const hwPublicNeuron = createMockNeuron(
    7n,
    NeuronVisibility.Public,
    "hardware-wallet"
  );
  const hwPrivateNeuron = createMockNeuron(
    8n,
    NeuronVisibility.Private,
    "hardware-wallet"
  );

  beforeEach(() => {
    allowLoggingInOneTestForDebugging();
    vi.restoreAllMocks();

    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [],
    });
    neuronsStore.reset();
  });

  const renderComponent = (neuron: NeuronInfo) => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();

    const { container, component } = render(ChangeBulkNeuronVisibilityForm, {
      props: {
        selectedNeurons: [],
        neuron,
      },
    });

    component.$on("nnsSubmit", mockSubmit);
    component.$on("nnsCancel", mockCancel);

    return {
      getSelectedNeurons: () => component.selectedNeurons,
      po: ChangeBulkNeuronVisibilityFormPo.under(
        new JestPageObjectElement(container)
      ),
      mockSubmit,
      mockCancel,
    };
  };

  it("should initialize with the provided neuron selected", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });

    const { po, getSelectedNeurons } = renderComponent(publicNeuron1);

    expect(await po.isNeuronRowVisible(publicNeuron1)).toBe(false);
    expect(getSelectedNeurons()).toEqual([publicNeuron1]);
  });

  it("should display and allow selection of public controlled neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });

    const { po, getSelectedNeurons } = renderComponent(publicNeuron1);

    expect(await po.isNeuronRowVisible(publicNeuron2)).toBe(true);
    expect(await po.isNeuronRowVisible(privateNeuron1)).toBe(false);

    await po.clickNeuronCheckbox(publicNeuron2);

    expect(await po.isNeuronCheckboxChecked(publicNeuron2)).toBe(true);
    expect(getSelectedNeurons()).toEqual([publicNeuron1, publicNeuron2]);
  });

  it("should select all controllable neurons when 'Apply to all' is clicked", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, hwPublicNeuron, hwPrivateNeuron],
      certified: true,
    });

    const { po, getSelectedNeurons } = renderComponent(publicNeuron1);

    await po.clickApplyToAll();

    expect(await po.isNeuronCheckboxChecked(publicNeuron2)).toBe(true);
    expect(await po.isUncontrollableNeuronRowVisible(hwPublicNeuron)).toBe(
      true
    );
    expect(await po.isUncontrollableNeuronRowVisible(hwPrivateNeuron)).toBe(
      false
    );

    expect(getSelectedNeurons()).toEqual([publicNeuron1, publicNeuron2]);
  });

  it("should update selection correctly when deselecting a neuron after 'Apply to all'", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });

    const { po, getSelectedNeurons } = renderComponent(publicNeuron1);

    await po.clickApplyToAll();
    await po.clickNeuronCheckbox(publicNeuron2);

    expect(await po.isNeuronCheckboxChecked(publicNeuron2)).toBe(false);
    expect(getSelectedNeurons()).toEqual([publicNeuron1]);
  });

  it("should handle visibility of neuron lists based on neuron types", async () => {
    neuronsStore.setNeurons({
      neurons: [
        publicNeuron1,
        uncontrolledPublicNeuron1,
        uncontrolledPrivateNeuron2,
      ],
      certified: true,
    });

    const { po } = renderComponent(publicNeuron1);

    expect(await po.isUncontrollableNeuronsListVisible()).toBe(true);
    expect(await po.isControllableNeuronsListVisible()).toBe(true);
    expect(await po.getUncontrollableNeuronsDescriptionText()).toBe(
      "These neurons have different controllers and won't be updated"
    );
  });

  it("should display correct neuron information and tags", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, publicSeedNeuron, privateNeuron1],
      certified: true,
    });

    const { po } = renderComponent(publicNeuron1);

    expect(await po.getControllableNeuronsDescription().getText()).toBe(
      "Neurons"
    );

    const publicNeuronCell = po.getNeuronVisibilityCell(publicNeuron2);
    expect(await publicNeuronCell.isPublic()).toBe(true);
    expect(await publicNeuronCell.getTags()).toEqual([]);

    const seedNeuronCell = po.getNeuronVisibilityCell(publicSeedNeuron);
    expect(await publicNeuronCell.isPublic()).toBe(true);
    expect(await seedNeuronCell.getNeuronId()).toBe(
      publicSeedNeuron.neuronId.toString()
    );
    expect(await seedNeuronCell.isPublic()).toBe(true);
    expect(await seedNeuronCell.getTags()).toEqual(["Seed"]);

    expect(await po.isNeuronRowVisible(privateNeuron1)).toBe(false);
  });

  it("should handle loading state correctly", async () => {
    neuronsStore.setNeurons({ neurons: undefined, certified: false });
    const { po } = renderComponent(publicNeuron1);

    expect(await po.isLoading()).toBe(true);

    neuronsStore.setNeurons({ neurons: [publicNeuron1], certified: true });
    await runResolvedPromises();

    expect(await po.isLoading()).toBe(false);
  });

  it("should show 'Apply to all' checkbox when there are controllable neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2],
      certified: true,
    });

    const { po } = renderComponent(publicNeuron1);

    expect(await po.isApplyToAllVisible()).toBe(true);
    expect((await po.getApplyToAllText()).trim()).toBe("Apply to all neurons");
  });

  it("should trigger appropriate events on button clicks", async () => {
    const { po, mockSubmit, mockCancel } = renderComponent(publicNeuron1);

    await po.clickConfirm();
    expect(mockSubmit).toHaveBeenCalled();

    await po.clickCancel();
    expect(mockCancel).toHaveBeenCalled();
  });

  it("should handle hardware wallet and hotkey uncontrolled neurons correctly", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, hwPublicNeuron, hwPrivateNeuron],
      certified: true,
    });

    const { po } = renderComponent(publicNeuron1);

    expect(await po.isControllableNeuronsListVisible()).toBe(true);
    expect(await po.isUncontrollableNeuronsListVisible()).toBe(true);

    expect(await po.isNeuronRowVisible(publicNeuron1)).toBe(false);
    expect(await po.isUncontrollableNeuronRowVisible(hwPublicNeuron)).toBe(
      true
    );
    expect(await po.isUncontrollableNeuronRowVisible(hwPrivateNeuron)).toBe(
      false
    );

    const hwPublicNeuronCell = po.getNeuronVisibilityCell(hwPublicNeuron);
    expect(await hwPublicNeuronCell.getNeuronId()).toBe(
      hwPublicNeuron.neuronId.toString()
    );
    expect(await hwPublicNeuronCell.isPublic()).toBe(true);
  });
});
