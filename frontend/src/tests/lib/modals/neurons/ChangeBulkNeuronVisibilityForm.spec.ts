import ChangeBulkNeuronVisibilityForm from "$lib/modals/neurons/ChangeBulkNeuronVisibilityForm.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
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

describe("ChangeBulkNeuronVisibilityForm", () => {
  const createMockNeuron = ({
    id,
    visibility,
    controller = mockMainAccount.principal.toString(),
    hotKeyController,
    stake,
  }: {
    id: bigint;
    visibility: NeuronVisibility;
    controller?: string;
    hotKeyController?: string;
    stake?: bigint;
  }): NeuronInfo =>
    ({
      neuronId: id,
      visibility,
      fullNeuron: {
        ...mockFullNeuron,
        id,
        controller,
        ...(hotKeyController !== undefined && { hotKeys: [hotKeyController] }),
        ...(stake !== undefined && { cachedNeuronStake: stake }),
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
  const privateNeuron2 = createMockNeuron({
    id: 4n,
    visibility: NeuronVisibility.Private,
  });
  const hwPublicNeuron = createMockNeuron({
    id: 5n,
    visibility: NeuronVisibility.Public,
    controller: mockHardwareWalletAccount.principal.toText(),
  });
  const hwPrivateNeuron = createMockNeuron({
    id: 6n,
    visibility: NeuronVisibility.Private,
    controller: mockHardwareWalletAccount.principal.toText(),
  });
  const publicSeedNeuron = createMockNeuron({
    id: 7n,
    visibility: NeuronVisibility.Public,
  });
  publicSeedNeuron.neuronType = NeuronType.Seed;
  const hotkeyPublicNeuron = createMockNeuron({
    id: 8n,
    visibility: NeuronVisibility.Public,
    controller: "other-controller",
    hotKeyController: mockIdentity.getPrincipal().toText(),
  });
  const publicNeuronWithStake1 = createMockNeuron({
    id: 9n,
    visibility: NeuronVisibility.Public,
    stake: 100_000_000n,
  });
  const publicNeuronWithStake2 = createMockNeuron({
    id: 10n,
    visibility: NeuronVisibility.Public,
    stake: 500_000_000n,
  });
  const publicNeuronWithStake3 = createMockNeuron({
    id: 11n,
    visibility: NeuronVisibility.Public,
    stake: 1_000_000_000n,
  });
  const hotkeyPublicNeuronWithStake = createMockNeuron({
    id: 12n,
    visibility: NeuronVisibility.Public,
    controller: "other-controller",
    hotKeyController: mockIdentity.getPrincipal().toText(),
    stake: 200_000_000n,
  });
  const hwPublicNeuronWithStake = createMockNeuron({
    id: 13n,
    visibility: NeuronVisibility.Public,
    controller: mockHardwareWalletAccount.principal.toText(),
    stake: 300_000_000n,
  });

  beforeEach(() => {
    resetIdentity();
    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [mockHardwareWalletAccount],
    });
  });

  const renderComponent = ({
    defaultSelectedNeuron,
    makePublic,
    onNnsSubmit = null,
    onNnsCancel = null,
  }: {
    defaultSelectedNeuron?: NeuronInfo;
    makePublic: boolean;
    onNnsSubmit?:
      | ((event: { detail: { selectedNeurons: NeuronInfo[] } }) => void)
      | null;
    onNnsCancel?: (() => void) | null;
  }) => {
    const { container, component } = render(ChangeBulkNeuronVisibilityForm, {
      props: {
        defaultSelectedNeuron,
        makePublic: makePublic,
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

  it("should initialize with the provided defaultSelectedNeuron selected and listed", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const po = renderComponent({
      defaultSelectedNeuron: publicNeuron1,
      makePublic: false,
      onNnsSubmit,
    });

    expect(
      await po
        .getControllableNeuronVisibilityRowPo(publicNeuron1.neuronId.toString())
        .getCheckboxPo()
        .isChecked()
    ).toBe(true);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    expect(controllableNeuronIds).toEqual([
      publicNeuron1.neuronId.toString(),
      publicNeuron2.neuronId.toString(),
    ]);

    await po.getConfirmButton().click();

    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [publicNeuron1] },
    });
  });

  it("when no defaultSelectedNeuron provided it should list all controllable neurons matching makePublic with checkbox unchecked ", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const po = renderComponent({
      makePublic: false,
      onNnsSubmit,
    });

    const controllableNeuronIds = await po.getControllableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      publicNeuron1.neuronId.toString(),
      publicNeuron2.neuronId.toString(),
    ]);

    expect(
      await po
        .getControllableNeuronVisibilityRowPo(publicNeuron1.neuronId.toString())
        .getCheckboxPo()
        .isChecked()
    ).toBe(false);
    expect(
      await po
        .getControllableNeuronVisibilityRowPo(publicNeuron2.neuronId.toString())
        .getCheckboxPo()
        .isChecked()
    ).toBe(false);
  });

  it("should display and allow selection of public controlled neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();
    const po = renderComponent({
      makePublic: false,
      onNnsSubmit,
    });

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      publicNeuron1.neuronId.toString(),
      publicNeuron2.neuronId.toString(),
    ]);

    expect(uncontrollableNeuronIds).toEqual([]);

    const checkboxPo = po
      .getControllableNeuronVisibilityRowPo(publicNeuron2.neuronId.toString())
      .getCheckboxPo();

    await checkboxPo.click();
    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(true);
    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [publicNeuron2] },
    });
  });

  it("should display and allow selection of private controlled neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [privateNeuron1, privateNeuron2, publicNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();
    const po = renderComponent({
      makePublic: true,
      onNnsSubmit,
    });

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      privateNeuron1.neuronId.toString(),
      privateNeuron2.neuronId.toString(),
    ]);

    expect(uncontrollableNeuronIds).toEqual([]);

    const checkboxPo = po
      .getControllableNeuronVisibilityRowPo(privateNeuron2.neuronId.toString())
      .getCheckboxPo();

    await checkboxPo.click();
    await po.getConfirmButton().click();

    expect(await checkboxPo.isChecked()).toBe(true);
    expect(onNnsSubmit).toHaveBeenCalledWith({
      detail: { selectedNeurons: [privateNeuron2] },
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

    const po = renderComponent({
      makePublic: false,
      onNnsSubmit,
    });

    await po.getApplyToAllCheckbox().click();

    const isControlledChecked = async (neuron: NeuronInfo) =>
      await po
        .getControllableNeuronVisibilityRowPo(neuron.neuronId.toString())
        .getCheckboxPo()
        .isChecked();

    const isUncontrolledChecked = async (neuron: NeuronInfo) =>
      await po
        .getUncontrollableNeuronVisibilityRowPo(neuron.neuronId.toString())
        .getCheckboxPo()
        .isChecked();

    expect(await isControlledChecked(publicNeuron1)).toBe(true);
    expect(await isControlledChecked(publicNeuron2)).toBe(true);
    expect(await isControlledChecked(publicSeedNeuron)).toBe(true);
    expect(await isUncontrolledChecked(hwPublicNeuron)).toBe(false);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      publicNeuron1.neuronId.toString(),
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

  it("should deselect all neurons when 'Apply to all' is clicked when all neurons are select", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, publicSeedNeuron],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const po = renderComponent({
      makePublic: false,
      onNnsSubmit,
    });

    await po.getApplyToAllCheckbox().click();

    const isChecked = async (neuron: NeuronInfo) =>
      await po
        .getControllableNeuronVisibilityRowPo(neuron.neuronId.toString())
        .getCheckboxPo()
        .isChecked();

    expect(await isChecked(publicNeuron1)).toBe(true);
    expect(await isChecked(publicNeuron2)).toBe(true);
    expect(await isChecked(publicSeedNeuron)).toBe(true);

    await po.getApplyToAllCheckbox().click();

    expect(await isChecked(publicNeuron1)).toBe(false);
    expect(await isChecked(publicNeuron2)).toBe(false);
    expect(await isChecked(publicSeedNeuron)).toBe(false);
  });

  it("should keep only the default neuron selected when 'Apply to all' is clicked when all neurons are select", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, publicSeedNeuron],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const po = renderComponent({
      defaultSelectedNeuron: publicNeuron2,
      makePublic: false,
      onNnsSubmit,
    });

    await po.getApplyToAllCheckbox().click();

    const isChecked = async (neuron: NeuronInfo) =>
      await po
        .getControllableNeuronVisibilityRowPo(neuron.neuronId.toString())
        .getCheckboxPo()
        .isChecked();

    expect(await isChecked(publicNeuron1)).toBe(true);
    expect(await isChecked(publicNeuron2)).toBe(true);
    expect(await isChecked(publicSeedNeuron)).toBe(true);

    await po.getApplyToAllCheckbox().click();

    expect(await isChecked(publicNeuron1)).toBe(false);
    expect(await isChecked(publicNeuron2)).toBe(true);
    expect(await isChecked(publicSeedNeuron)).toBe(false);
  });

  it("should call nnsSubmit with selected neurons correctly when deselecting a neuron after 'Apply to all'", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2, publicSeedNeuron, privateNeuron1],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const po = renderComponent({
      makePublic: false,
      onNnsSubmit,
    });

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

  it("should disable confirm button when no neurons are selected", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2],
      certified: true,
    });
    const onNnsSubmit = vi.fn();

    const po = renderComponent({
      makePublic: false,
      onNnsSubmit,
    });

    expect(await po.getConfirmButton().isDisabled()).toBe(true);

    const checkboxPo = po
      .getControllableNeuronVisibilityRowPo(publicNeuron2.neuronId.toString())
      .getCheckboxPo();
    await checkboxPo.click();

    expect(await po.getConfirmButton().isDisabled()).toBe(false);

    await checkboxPo.click();

    expect(await po.getConfirmButton().isDisabled()).toBe(true);
  });

  it("should display both lists descriptions when there are no neurons to list in controllable neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [hotkeyPublicNeuron],
      certified: true,
    });

    const po = renderComponent({
      makePublic: false,
    });

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
        hotkeyPublicNeuron,
      ],
      certified: true,
    });

    const po = renderComponent({
      makePublic: false,
    });

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
      "Ledger device"
    );

    const hotkeyPublicNeuronRowPo = po.getUncontrollableNeuronVisibilityRowPo(
      hotkeyPublicNeuron.neuronId.toString()
    );

    expect(await hotkeyPublicNeuronRowPo.getNeuronId()).toBe(
      hotkeyPublicNeuron.neuronId.toString()
    );
    expect(await hotkeyPublicNeuronRowPo.isPublic()).toBe(true);
    expect(
      await hotkeyPublicNeuronRowPo.getUncontrolledNeuronDetailsText()
    ).toBe(hotkeyPublicNeuron.fullNeuron.controller);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      publicNeuron1.neuronId.toString(),
      publicNeuron2.neuronId.toString(),
      publicSeedNeuron.neuronId.toString(),
    ]);

    expect(uncontrollableNeuronIds).toEqual([
      hwPublicNeuron.neuronId.toString(),
      hotkeyPublicNeuron.neuronId.toString(),
    ]);
  });

  it("should handle loading state correctly", async () => {
    neuronsStore.setNeurons({ neurons: undefined, certified: false });
    const po = renderComponent({
      makePublic: false,
    });

    expect(await po.getLoadingContainer().isPresent()).toBe(true);

    neuronsStore.setNeurons({ neurons: [publicNeuron1], certified: true });
    await runResolvedPromises();

    expect(await po.getLoadingContainer().isPresent()).toBe(false);
  });

  it("should show 'Apply to all' checkbox when there are more than 1 controllable neurons to list", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1, publicNeuron2],
      certified: true,
    });

    const po = renderComponent({
      makePublic: false,
    });

    expect(await po.getApplyToAllCheckbox().isPresent()).toBe(true);
    expect((await po.getApplyToAllCheckbox().getText()).trim()).toBe(
      "Apply to all neurons"
    );
  });

  it("should not show 'Apply to all' checkbox when there is only than 1 controllable neurons to list", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1],
      certified: true,
    });

    const po = renderComponent({
      makePublic: false,
    });

    expect(await po.getApplyToAllCheckbox().isPresent()).toBe(false);
  });

  it("should trigger appropriate events on button clicks", async () => {
    neuronsStore.setNeurons({
      neurons: [publicNeuron1],
      certified: true,
    });

    const onNnsSubmit = vi.fn();
    const onNnsCancel = vi.fn();
    const po = renderComponent({
      makePublic: false,
      defaultSelectedNeuron: publicNeuron1,
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
        hotkeyPublicNeuron,
      ],
      certified: true,
    });

    const po = renderComponent({
      makePublic: false,
    });

    expect(await po.getControllableNeuronsList().isPresent()).toBe(true);
    expect(await po.getUncontrollableNeuronsList().isPresent()).toBe(true);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual(["1"]);

    expect(uncontrollableNeuronIds).toEqual([
      hwPublicNeuron.neuronId.toString(),
      hotkeyPublicNeuron.neuronId.toString(),
    ]);
  });

  it("should display correct StakedAmount for each neuron", async () => {
    neuronsStore.setNeurons({
      neurons: [
        publicNeuronWithStake1,
        publicNeuronWithStake2,
        hotkeyPublicNeuronWithStake,
        hwPublicNeuronWithStake,
      ],
      certified: true,
    });

    const po = renderComponent({
      makePublic: false,
    });

    expect(
      await po
        .getControllableNeuronVisibilityRowPo(
          publicNeuronWithStake1.neuronId.toString()
        )
        .getAmountDisplayPo()
        .getText()
    ).toBe("1.00 ICP");

    expect(
      await po
        .getControllableNeuronVisibilityRowPo(
          publicNeuronWithStake2.neuronId.toString()
        )
        .getAmountDisplayPo()
        .getText()
    ).toBe("5.00 ICP");

    expect(
      await po
        .getUncontrollableNeuronVisibilityRowPo(
          hotkeyPublicNeuronWithStake.neuronId.toString()
        )
        .getAmountDisplayPo()
        .isPresent()
    ).toBe(false);

    expect(
      await po
        .getUncontrollableNeuronVisibilityRowPo(
          hwPublicNeuronWithStake.neuronId.toString()
        )
        .getAmountDisplayPo()
        .isPresent()
    ).toBe(false);

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      publicNeuronWithStake2.neuronId.toString(),
      publicNeuronWithStake1.neuronId.toString(),
    ]);

    expect(uncontrollableNeuronIds).toEqual([
      hwPublicNeuronWithStake.neuronId.toString(),
      hotkeyPublicNeuronWithStake.neuronId.toString(),
    ]);
  });

  it("should sort controlled and uncontrolled neurons based on StakedAmount", async () => {
    neuronsStore.setNeurons({
      neurons: [
        publicNeuronWithStake1,
        publicNeuronWithStake2,
        publicNeuronWithStake3,
        hotkeyPublicNeuronWithStake,
        hwPublicNeuronWithStake,
      ],
      certified: true,
    });

    const po = renderComponent({
      makePublic: false,
    });

    const controllableNeuronIds = await po.getControllableNeuronIds();
    const uncontrollableNeuronIds = await po.getUncontrollableNeuronIds();

    expect(controllableNeuronIds).toEqual([
      publicNeuronWithStake3.neuronId.toString(),
      publicNeuronWithStake2.neuronId.toString(),
      publicNeuronWithStake1.neuronId.toString(),
    ]);

    expect(uncontrollableNeuronIds).toEqual([
      hwPublicNeuronWithStake.neuronId.toString(),
      hotkeyPublicNeuronWithStake.neuronId.toString(),
    ]);
  });
});
