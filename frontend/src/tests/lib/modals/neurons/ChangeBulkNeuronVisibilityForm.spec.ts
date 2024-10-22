import ChangeBulkNeuronVisibilityForm from "$lib/modals/neurons/ChangeBulkNeuronVisibilityForm.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron } from "$tests/mocks/neurons.mock";
import { ChangeBulkNeuronVisibilityFormPo } from "$tests/page-objects/ChangeBulkNeuronVisibilityForm.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronType, NeuronVisibility, type NeuronInfo } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("ChangeBulkNeuronVisibilityForm", () => {
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

  const publicNeuron1 = createMockNeuron({
    id: 1n,
    visibility: NeuronVisibility.Public,
  });
  const publicNeuron2 = createMockNeuron({
    id: 2n,
    visibility: NeuronVisibility.Public,
  });
  const privateNeuron1 = createMockNeuron({
    id: 3n,
    visibility: NeuronVisibility.Private,
  });
  const publicSeedNeuron = createMockNeuron({
    id: 9n,
    visibility: NeuronVisibility.Public,
  });
  publicSeedNeuron.neuronType = NeuronType.Seed;

  const uncontrolledPublicNeuron = createMockNeuron({
    id: 5n,
    visibility: NeuronVisibility.Public,
    controller: "other-controller",
  });
  const uncontrolledPrivateNeuron = createMockNeuron({
    id: 6n,
    visibility: NeuronVisibility.Private,
    controller: "other-controller",
  });
  const hwPublicNeuron = createMockNeuron({
    id: 7n,
    visibility: NeuronVisibility.Public,
    controller: mockHardwareWalletAccount.principal.toText(),
  });
  const hwPrivateNeuron = createMockNeuron({
    id: 8n,
    visibility: NeuronVisibility.Private,
    controller: mockHardwareWalletAccount.principal.toText(),
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [mockHardwareWalletAccount],
    });
    neuronsStore.reset();
  });

  const renderComponent = ({
    neuron,
    onNnsSubmit = null,
    onNnsCancel = null,
  }: {
    neuron: NeuronInfo;
    onNnsSubmit?:
      | ((event: { detail: { selectedNeurons: NeuronInfo[] } }) => void)
      | null;
    onNnsCancel?: (() => void) | null;
  }) => {
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
    if (nonNullish(onNnsCancel)) {
      component.$on("nnsCancel", onNnsCancel);
    }

    return ChangeBulkNeuronVisibilityFormPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should initialize with the provided neuron selected and not listed", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const po = renderComponent({ neuron: publicNeuron1, onNnsSubmit });

    await po.getConfirmButton().click();

    const controllableNeuronIds = await po.getControllableNeuronIds();
    expect(controllableNeuronIds).toEqual([publicNeuron2.neuronId.toString()]);

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
    const po = renderComponent({
      neuron: publicNeuron1,
      onNnsSubmit,
    });

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([publicNeuron2.neuronId.toString()]);

    expect(uncontrollableNeuronIds).toEqual([]);

    const checkboxPo = po
      .getControllableNeuronVisibilityRowPo(publicNeuron2.neuronId.toString())
      .getCheckboxPo();

    await checkboxPo.click();
    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(true);
    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [publicNeuron1, publicNeuron2] },
    });
  });

  it("should select all controllable neurons by user when 'Apply to all' is clicked", async () => {
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

    const po = renderComponent({ neuron: publicNeuron1, onNnsSubmit });

    await po.getApplyToAllCheckbox().click();

    expect(
      await po
        .getControllableNeuronVisibilityRowPo(publicNeuron2.neuronId.toString())
        .getCheckboxPo()
        .isChecked()
    ).toBe(true);
    expect(
      await po
        .getControllableNeuronVisibilityRowPo(
          publicSeedNeuron.neuronId.toString()
        )
        .getCheckboxPo()
        .isChecked()
    ).toBe(true);
    expect(
      await po
        .getUncontrollableNeuronVisibilityRowPo(
          hwPublicNeuron.neuronId.toString()
        )
        .getCheckboxPo()
        .isChecked()
    ).toBe(false);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      publicNeuron2.neuronId.toString(),
      publicSeedNeuron.neuronId.toString(),
    ]);

    expect(uncontrollableNeuronIds).toEqual([
      hwPublicNeuron.neuronId.toString(),
    ]);

    await po.getConfirmButton().click();

    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: {
        selectedNeurons: [publicNeuron1, publicNeuron2, publicSeedNeuron],
      },
    });
  });

  it("should call nnsSubmit with selected neurons correctly when deselecting a neuron after 'Apply to all'", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, publicSeedNeuron, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const po = renderComponent({ neuron: publicNeuron1, onNnsSubmit });

    const applyToAllCheckboxPo = po.getApplyToAllCheckbox();
    await applyToAllCheckboxPo.click();

    expect(await applyToAllCheckboxPo.isChecked()).toBe(true);

    const checkboxPo = po
      .getControllableNeuronVisibilityRowPo(publicNeuron2.neuronId.toString())
      .getCheckboxPo();
    await checkboxPo.click();

    expect(await checkboxPo.isChecked()).toBe(false);
    expect(await applyToAllCheckboxPo.isChecked()).toBe(false);

    await po.getConfirmButton().click();

    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [publicNeuron1, publicSeedNeuron] },
    });
  });

  it("should display both lists descriptions when there are no neurons to list in controllable neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [
        publicNeuron1,
        uncontrolledPublicNeuron,
        uncontrolledPrivateNeuron,
      ],
      certified: true,
    });

    const po = renderComponent({ neuron: publicNeuron1 });

    expect(await po.getUncontrollableNeuronsList().isPresent()).toBe(true);
    expect(await po.getControllableNeuronsList().isPresent()).toBe(true);
    expect(await po.getControllableNeuronsDescription().getText()).toBe(
      "Neurons"
    );
    expect(await po.getUncontrollableNeuronsDescription().getText()).toBe(
      "These neurons have different controllers and won't be updated"
    );
  });

  it("should display correct neuron information, tags and detail", async () => {
    neuronsStore.setNeurons({
      neurons: [
        publicNeuron1,
        publicNeuron2,
        publicSeedNeuron,
        privateNeuron1,
        hwPublicNeuron,
      ],
      certified: true,
    });

    const po = renderComponent({ neuron: publicNeuron1 });

    expect(await po.getControllableNeuronsDescription().getText()).toBe(
      "Neurons"
    );

    const publicNeuronRowPo = po.getControllableNeuronVisibilityRowPo(
      publicNeuron2.neuronId.toString()
    );
    expect(await publicNeuronRowPo.getNeuronId()).toBe(
      publicNeuron2.neuronId.toString()
    );
    expect(await publicNeuronRowPo.isPublic()).toBe(true);
    expect(await publicNeuronRowPo.getTags()).toEqual([]);

    const seedNeuronRowPo = po.getControllableNeuronVisibilityRowPo(
      publicSeedNeuron.neuronId.toString()
    );

    expect(await seedNeuronRowPo.getNeuronId()).toBe(
      publicSeedNeuron.neuronId.toString()
    );
    expect(await seedNeuronRowPo.isPublic()).toBe(true);
    expect(await seedNeuronRowPo.getTags()).toEqual(["Seed"]);

    const hwPublicNeuronRowPo = po.getUncontrollableNeuronVisibilityRowPo(
      hwPublicNeuron.neuronId.toString()
    );

    expect(await hwPublicNeuronRowPo.getNeuronId()).toBe(
      hwPublicNeuron.neuronId.toString()
    );
    expect(await hwPublicNeuronRowPo.isPublic()).toBe(true);
    expect(await hwPublicNeuronRowPo.getUncontrolledNeuronDetailsText()).toBe(
      "Hardware wallet"
    );

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      publicNeuron2.neuronId.toString(),
      publicSeedNeuron.neuronId.toString(),
    ]);

    expect(uncontrollableNeuronIds).toEqual([
      hwPublicNeuron.neuronId.toString(),
    ]);
  });

  it("should handle loading state correctly", async () => {
    neuronsStore.setNeurons({ neurons: undefined, certified: false });
    const po = renderComponent({ neuron: publicNeuron1 });

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

    const po = renderComponent({ neuron: publicNeuron1 });

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

    const po = renderComponent({ neuron: publicNeuron1 });

    expect(await po.getApplyToAllCheckbox().isPresent()).toBe(false);
  });

  it("should trigger appropriate events on button clicks", async () => {
    const onNnsSubmit = vi.fn();
    const onNnsCancel = vi.fn();
    const po = renderComponent({
      neuron: publicNeuron1,
      onNnsSubmit,
      onNnsCancel,
    });

    await po.getConfirmButton().click();
    expect(onNnsSubmit).toHaveBeenCalled();

    await po.getCancelButton().click();
    expect(onNnsCancel).toHaveBeenCalled();
  });

  it("should display controlled hardware wallet, and hotkey uncontrolled neurons in uncontrollable neurons list", async () => {
    neuronsStore.setNeurons({
      neurons: [
        publicNeuron1,
        hwPublicNeuron,
        hwPrivateNeuron,
        uncontrolledPublicNeuron,
      ],
      certified: true,
    });

    const po = renderComponent({ neuron: publicNeuron1 });

    expect(await po.getControllableNeuronsList().isPresent()).toBe(true);
    expect(await po.getUncontrollableNeuronsList().isPresent()).toBe(true);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([]);

    expect(uncontrollableNeuronIds).toEqual([
      hwPublicNeuron.neuronId.toString(),
      uncontrolledPublicNeuron.neuronId.toString(),
    ]);
  });
});
