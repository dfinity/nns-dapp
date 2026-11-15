import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import ChangeHotkeyModal from "$lib/modals/hotkeys/ChangeHotkeyModal.svelte";
import * as hotkeysServices from "$lib/services/hotkeys.services";
import type { Hotkey } from "$lib/types/hotkeys";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ChangeHotkeyModalPo } from "$tests/page-objects/ChangeHotkeyModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

describe("ChangeHotkeyModal", () => {
  const oldHotkey = principal(1).toText();
  const newHotkey = principal(2).toText();
  const snsUniverseId = principal(10).toText();

  const hotkey: Hotkey = {
    principal: oldHotkey,
    neuronCount: 3,
    projects: [
      {
        universe: {
          canisterId: OWN_CANISTER_ID_TEXT,
          title: "Internet Computer",
          logo: "icp-logo",
        },
        neurons: [
          { neuronId: "11", canChange: true },
          { neuronId: "12", canChange: false },
        ],
      },
      {
        universe: { canisterId: snsUniverseId, title: "SNS-1", logo: "logo" },
        neurons: [{ neuronId: "abcd", canChange: true }],
      },
    ],
  };

  const nnsRef = { universeId: OWN_CANISTER_ID_TEXT, neuronId: "11" };
  const snsRef = { universeId: snsUniverseId, neuronId: "abcd" };

  let spyChange;
  const onClose = vi.fn();
  const onChange = vi.fn();

  beforeEach(() => {
    resetIdentity();
    spyChange = vi
      .spyOn(hotkeysServices, "changeHotkeyOnNeurons")
      .mockImplementation(async ({ neurons }) =>
        neurons.map((neuron) => ({ ...neuron, success: true }))
      );
  });

  const renderModal = (
    type: "replace" | "remove",
    { isLoading = false }: { isLoading?: boolean } = {}
  ) => {
    const { container } = render(ChangeHotkeyModal, {
      props: { hotkey, type, onChange, onClose, isLoading },
    });
    return ChangeHotkeyModalPo.under(new JestPageObjectElement(container));
  };

  it("should select all the neurons that the user can change", async () => {
    const po = renderModal("remove");

    expect(await po.getCurrentHotkey()).toBe(oldHotkey);
    const checkboxes = await po.getNeuronCheckboxPos();
    expect(await Promise.all(checkboxes.map((c) => c.isChecked()))).toEqual([
      true,
      false,
      true,
    ]);
    expect(await Promise.all(checkboxes.map((c) => c.isDisabled()))).toEqual([
      false,
      true,
      false,
    ]);
    expect(await po.getCannotChangeCount()).toBe(1);
    expect(await po.getProjectSelectedCounts()).toEqual(["1 of 2", "1 of 1"]);
    expect(await po.getConfirmButtonPo().getText()).toBe(
      "Remove from 2 Neurons"
    );
  });

  it("should remove the hotkey from the selected neurons", async () => {
    const po = renderModal("remove");

    const [nnsCheckbox] = await po.getNeuronCheckboxPos();
    await nnsCheckbox.toggle();
    expect(await po.getConfirmButtonPo().getText()).toBe(
      "Remove from 1 Neurons"
    );

    await po.clickConfirm();
    await runResolvedPromises();

    expect(spyChange).toHaveBeenCalledWith({
      change: { type: "remove", principal: oldHotkey },
      neurons: [snsRef],
    });
    expect(await po.hasResultSuccess()).toBe(true);
    expect(onChange).toHaveBeenCalledWith([snsUniverseId]);
  });

  it("should ask for a valid new hotkey before a replace", async () => {
    const po = renderModal("replace");

    expect(await po.hasWarning()).toBe(true);
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(true);

    await po.typeNewHotkey(oldHotkey);
    expect(await po.hasSameHotkeyError()).toBe(true);
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(true);

    await po.typeNewHotkey(newHotkey);
    expect(await po.hasSameHotkeyError()).toBe(false);
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(false);
    expect(await po.getConfirmButtonPo().getText()).toBe(
      "Replace on 2 Neurons"
    );
  });

  it("should replace the hotkey on the selected neurons", async () => {
    const po = renderModal("replace");

    await po.typeNewHotkey(newHotkey);
    await po.clickConfirm();
    await runResolvedPromises();

    expect(spyChange).toHaveBeenCalledWith({
      change: {
        type: "replace",
        principal: oldHotkey,
        newPrincipal: newHotkey,
      },
      neurons: [nnsRef, snsRef],
    });
    expect(await po.hasResultSuccess()).toBe(true);
  });

  it("should show the failed neurons and retry only those", async () => {
    spyChange.mockImplementationOnce(async ({ neurons }) =>
      neurons.map((neuron) => ({
        ...neuron,
        success: neuron.universeId === OWN_CANISTER_ID_TEXT,
      }))
    );
    const po = renderModal("remove");

    await po.clickConfirm();
    await runResolvedPromises();

    expect(await po.hasResultPartial()).toBe(true);
    expect(await po.getFailedNeurons()).toEqual(["SNS-1 abcd"]);

    await po.clickRetry();
    await runResolvedPromises();

    expect(spyChange).toHaveBeenLastCalledWith({
      change: { type: "remove", principal: oldHotkey },
      neurons: [snsRef],
    });
    expect(await po.hasResultSuccess()).toBe(true);

    await po.clickClose();
    expect(onClose).toHaveBeenCalled();
  });

  it("should not retry while the page loads neurons", async () => {
    spyChange.mockImplementationOnce(async ({ neurons }) =>
      neurons.map((neuron) => ({ ...neuron, success: false }))
    );
    const po = renderModal("remove", { isLoading: true });

    await po.clickConfirm();
    await runResolvedPromises();

    expect(await po.hasResultPartial()).toBe(true);
    expect(await po.isRetryDisabled()).toBe(true);
  });
});
