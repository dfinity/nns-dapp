import MakeNeuronsPublicForm from "$lib/modals/neurons/MakeNeuronsPublicForm.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron } from "$tests/mocks/neurons.mock";
import { MakeNeuronsPublicFormPo } from "$tests/page-objects/MakeNeuronsPublicForm.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronType, NeuronVisibility, type NeuronInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
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

  const uncontrolledHardwareWalletPrincipal = Principal.fromText(
    "pin7y-wyaaa-aaaaa-aacpa-cai"
  );

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

  const uncontrolledPrivateNeuron = createMockNeuron({
    id: 5n,
    visibility: NeuronVisibility.Private,
    controller: "other-controller",
  });
  const hwPrivateNeuron = createMockNeuron({
    id: 6n,
    visibility: NeuronVisibility.Private,
    controller: mockHardwareWalletAccount.principal.toText(),
  });

  const uncontrolledHwPrivateNeuron = createMockNeuron({
    id: 7n,
    visibility: NeuronVisibility.Private,
    controller: uncontrolledHardwareWalletPrincipal.toText(),
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
    onNnsSubmit = null,
    onNnsCancel = null,
  }: {
    onNnsSubmit?:
      | ((event: { detail: { selectedNeurons: NeuronInfo[] } }) => void)
      | null;
    onNnsCancel?: (() => void) | null;
  }) => {
    const { container, component } = render(MakeNeuronsPublicForm);

    if (nonNullish(onNnsSubmit)) {
      component.$on("nnsSubmit", ({ detail }) => {
        onNnsSubmit({ detail });
      });
    }
    if (nonNullish(onNnsCancel)) {
      component.$on("nnsCancel", onNnsCancel);
    }

    return {
      po: MakeNeuronsPublicFormPo.under(new JestPageObjectElement(container)),
    };
  };

  it("should initialize with no neurons selected and button disabled", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });

    const { po } = renderComponent({});

    expect(await po.getConfirmButton().isDisabled()).toBe(true);
    const controllableNeuronIds = await po.getControllableNeuronIds();
    expect(controllableNeuronIds).toEqual([
      privateNeuron1.neuronId.toString(),
      privateNeuron2.neuronId.toString(),
    ]);
  });

  it("should display and allow selection of private controlled neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });

    const onNnsSubmit = vi.fn();
    const { po } = renderComponent({ onNnsSubmit });

    const controllableNeuronIds = await po.getControllableNeuronIds();
    expect(controllableNeuronIds).toEqual([
      privateNeuron1.neuronId.toString(),
      privateNeuron2.neuronId.toString(),
    ]);

    const checkboxPo = po
      .getControllableNeuronVisibilityRowPo(privateNeuron1.neuronId.toString())
      .getCheckboxPo();

    await checkboxPo.click();

    expect(await po.getConfirmButton().isDisabled()).toBe(false);

    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(true);
    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [privateNeuron1] },
    });
  });

  it("should select all private neurons when 'Apply to all' is clicked", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });

    const onNnsSubmit = vi.fn();
    const { po } = renderComponent({ onNnsSubmit });

    await po.getApplyToAllCheckbox().click();
    await po.getConfirmButton().click();

    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [privateNeuron1, privateNeuron2] },
    });
  });

  it("should update selection correctly when deselecting a neuron after 'Apply to all'", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });

    const onNnsSubmit = vi.fn();
    const { po } = renderComponent({ onNnsSubmit });

    const applyToAllCheckboxPo = po.getApplyToAllCheckbox();
    await applyToAllCheckboxPo.click();

    const checkboxPo = po
      .getControllableNeuronVisibilityRowPo(privateNeuron2.neuronId.toString())
      .getCheckboxPo();
    await checkboxPo.click();

    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(false);
    expect(await applyToAllCheckboxPo.isChecked()).toBe(false);

    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [privateNeuron1] },
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

    const { po } = renderComponent({});

    expect(await po.getControllableNeuronsDescription().getText()).toBe(
      "Neurons"
    );

    const privateNeuronRowPo = po.getControllableNeuronVisibilityRowPo(
      privateNeuron1.neuronId.toString()
    );
    expect(await privateNeuronRowPo.isPublic()).toBe(false);
    expect(await privateNeuronRowPo.getTags()).toEqual([]);

    const seedNeuronRowPo = po.getControllableNeuronVisibilityRowPo(
      privateSeedNeuron.neuronId.toString()
    );
    expect(await seedNeuronRowPo.getNeuronId()).toBe(
      privateSeedNeuron.neuronId.toString()
    );
    expect(await seedNeuronRowPo.isPublic()).toBe(false);
    expect(await seedNeuronRowPo.getTags()).toEqual(["Seed"]);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    expect(controllableNeuronIds).not.toContain(
      publicNeuron1.neuronId.toString()
    );
  });

  it("should handle loading state correctly", async () => {
    neuronsStore.setNeurons({ neurons: undefined, certified: false });
    const { po } = renderComponent({});

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

    const { po } = renderComponent({});

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

    const { po } = renderComponent({});
    expect(await po.getConfirmButton().isDisabled()).toBe(true);

    await po
      .getControllableNeuronVisibilityRowPo(privateNeuron1.neuronId.toString())
      .getCheckboxPo()
      .click();

    expect(await po.getConfirmButton().isDisabled()).toBe(false);
  });

  it("should display controlled hardware wallet, uncontrolled hardware wallets and hotkey uncontrolled neurons in uncontrollable neurons list", async () => {
    neuronsStore.setNeurons({
      neurons: [
        privateNeuron1,
        hwPrivateNeuron,
        uncontrolledPrivateNeuron,
        uncontrolledHwPrivateNeuron,
      ],
      certified: true,
    });

    const onNnsSubmit = vi.fn();
    const { po } = renderComponent({ onNnsSubmit });

    expect(await po.getControllableNeuronsList().isPresent()).toBe(true);
    expect(await po.getUncontrollableNeuronsList().isPresent()).toBe(true);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([privateNeuron1.neuronId.toString()]);
    expect(uncontrollableNeuronIds).toEqual([
      hwPrivateNeuron.neuronId.toString(),
      uncontrolledPrivateNeuron.neuronId.toString(),
      uncontrolledHwPrivateNeuron.neuronId.toString(),
    ]);

    await po
      .getControllableNeuronVisibilityRowPo(privateNeuron1.neuronId.toString())
      .getCheckboxPo()
      .click();
    await po.getConfirmButton().click();

    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [privateNeuron1] },
    });
  });

  it("should not allow selection of uncontrolled neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, uncontrolledPrivateNeuron],
      certified: true,
    });
    const onNnsSubmit = vi.fn();
    const { po } = renderComponent({ onNnsSubmit });

    const controllableCheckboxPo = po
      .getControllableNeuronVisibilityRowPo(privateNeuron1.neuronId.toString())
      .getCheckboxPo();
    const uncontrollableCheckboxPo = po
      .getUncontrollableNeuronVisibilityRowPo(
        uncontrolledPrivateNeuron.neuronId.toString()
      )
      .getCheckboxPo();

    expect(await controllableCheckboxPo.isDisabled()).toBe(false);
    expect(await uncontrollableCheckboxPo.isDisabled()).toBe(true);

    await controllableCheckboxPo.click();
    await po.getConfirmButton().click();

    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [privateNeuron1] },
    });
  });

  it("should trigger cancel events on cancel button clicks", async () => {
    const onNnsCancel = vi.fn();
    const { po } = renderComponent({
      onNnsCancel,
    });

    await po.getCancelButton().click();
    expect(onNnsCancel).toHaveBeenCalled();
  });
});
