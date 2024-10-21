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
import { nonNullish } from "@dfinity/utils";
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

  const renderComponent = (neuron: NeuronInfo, onNnsSubmit = null) => {
    const mockCancel = vi.fn();

    const { container, component } = render(ChangeBulkNeuronVisibilityForm, {
      props: {
        neuron,
      },
    });

    if (nonNullish(onNnsSubmit)) {
      component.$on("nnsSubmit", ({ detail }) => {
        onNnsSubmit({ detail });
      });
    }

    component.$on("nnsCancel", mockCancel);

    return {
      po: ChangeBulkNeuronVisibilityFormPo.under(
        new JestPageObjectElement(container)
      ),
      mockCancel,
    };
  };

  it("should initialize with the provided neuron selected", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const { po } = renderComponent(publicNeuron1, onNnsSubmit);

    await po.getConfirmButton().click();

    expect(await po.getNeuronVisibilityRowPo(publicNeuron1).isPresent()).toBe(
      false
    );
    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [publicNeuron1] },
    });
  });

  it("should display and allow selection of public controlled neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();
    const { po } = renderComponent(publicNeuron1, onNnsSubmit);

    expect(await po.getNeuronVisibilityRowPo(publicNeuron2).isPresent()).toBe(
      true
    );
    expect(await po.getNeuronVisibilityRowPo(privateNeuron1).isPresent()).toBe(
      false
    );
    const checkboxPo = po
      .getNeuronVisibilityRowPo(publicNeuron2)
      .getCheckboxPo();

    await checkboxPo.click();
    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(true);
    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [publicNeuron1, publicNeuron2] },
    });
  });

  it("should select all controllable neurons when 'Apply to all' is clicked", async () => {
    neuronsStore.setNeurons({
      neurons: [
        publicNeuron1,
        publicNeuron2,
        publicSeedNeuron,
        hwPublicNeuron,
        hwPrivateNeuron,
      ],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const { po } = renderComponent(publicNeuron1, onNnsSubmit);

    await po.getApplyToAllCheckbox().click();
    await po.getConfirmButton().click();

    expect(await po.getNeuronVisibilityRowPo(publicNeuron2).isPresent()).toBe(
      true
    );
    expect(
      await po.getNeuronVisibilityRowPo(publicSeedNeuron).isPresent()
    ).toBe(true);
    expect(await po.getNeuronVisibilityRowPo(hwPublicNeuron).isPresent()).toBe(
      true
    );
    expect(await po.getNeuronVisibilityRowPo(hwPrivateNeuron).isPresent()).toBe(
      false
    );

    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: {
        selectedNeurons: [publicNeuron1, publicNeuron2, publicSeedNeuron],
      },
    });
  });

  it("should update selection correctly when deselecting a neuron after 'Apply to all'", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, publicSeedNeuron, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const { po } = renderComponent(publicNeuron1, onNnsSubmit);

    const applyToAllCheckboxPo = po.getApplyToAllCheckbox();
    await applyToAllCheckboxPo.click();

    const checkboxPo = po
      .getNeuronVisibilityRowPo(publicNeuron2)
      .getCheckboxPo();
    await checkboxPo.click();

    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(false);
    expect(await applyToAllCheckboxPo.isChecked()).toBe(false);
    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [publicNeuron1, publicSeedNeuron] },
    });
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

    expect(await po.getUncontrollableNeuronsList().isPresent()).toBe(true);
    expect(await po.getControllableNeuronsList().isPresent()).toBe(true);
    expect(await po.getUncontrollableNeuronsDescription().getText()).toBe(
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

    const publicNeuronRowPo = po.getNeuronVisibilityRowPo(publicNeuron2);
    expect(await publicNeuronRowPo.isPublic()).toBe(true);
    expect(await publicNeuronRowPo.getTags()).toEqual([]);

    const seedNeuronRowPo = po.getNeuronVisibilityRowPo(publicSeedNeuron);
    expect(await publicNeuronRowPo.isPublic()).toBe(true);
    expect(await seedNeuronRowPo.getNeuronId()).toBe(
      publicSeedNeuron.neuronId.toString()
    );
    expect(await seedNeuronRowPo.isPublic()).toBe(true);
    expect(await seedNeuronRowPo.getTags()).toEqual(["Seed"]);

    expect(await po.getNeuronVisibilityRowPo(privateNeuron1).isPresent()).toBe(
      false
    );
  });

  it("should handle loading state correctly", async () => {
    neuronsStore.setNeurons({ neurons: undefined, certified: false });
    const { po } = renderComponent(publicNeuron1);

    expect(await po.getLoadingContainer().isPresent()).toBe(true);

    neuronsStore.setNeurons({ neurons: [publicNeuron1], certified: true });
    await runResolvedPromises();

    expect(await po.getLoadingContainer().isPresent()).toBe(false);
  });

  it("should show 'Apply to all' checkbox when there are more than 1 controllable neurons to list", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, publicSeedNeuron],
      certified: true,
    });

    const { po } = renderComponent(publicNeuron1);

    expect(await po.getApplyToAllCheckbox().isPresent()).toBe(true);
    expect((await po.getApplyToAllCheckbox().getText()).trim()).toBe(
      "Apply to all neurons"
    );
  });

  it("should not show 'Apply to all' checkbox when there is only than 1 controllable neurons to list", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2],
      certified: true,
    });

    const { po } = renderComponent(publicNeuron1);

    expect(await po.getApplyToAllCheckbox().isPresent()).toBe(false);
  });

  it("should trigger appropriate events on button clicks", async () => {
    const onNnsSubmit = vi.fn();
    const { po, mockCancel } = renderComponent(publicNeuron1, onNnsSubmit);

    await po.getConfirmButton().click();
    expect(onNnsSubmit).toHaveBeenCalled();

    await po.getCancelButton().click();
    expect(mockCancel).toHaveBeenCalled();
  });

  it("should handle hardware wallet and hotkey uncontrolled neurons correctly", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, hwPublicNeuron, hwPrivateNeuron],
      certified: true,
    });

    const { po } = renderComponent(publicNeuron1);

    expect(await po.getControllableNeuronsList().isPresent()).toBe(true);
    expect(await po.getUncontrollableNeuronsList().isPresent()).toBe(true);

    expect(await po.getNeuronVisibilityRowPo(publicNeuron1).isPresent()).toBe(
      false
    );
    expect(await po.getNeuronVisibilityRowPo(hwPublicNeuron).isPresent()).toBe(
      true
    );
    expect(await po.getNeuronVisibilityRowPo(hwPrivateNeuron).isPresent()).toBe(
      false
    );

    const hwPublicNeuronRowPo = po.getNeuronVisibilityRowPo(hwPublicNeuron);
    expect(await hwPublicNeuronRowPo.getNeuronId()).toBe(
      hwPublicNeuron.neuronId.toString()
    );
    expect(await hwPublicNeuronRowPo.isPublic()).toBe(true);
  });
});
