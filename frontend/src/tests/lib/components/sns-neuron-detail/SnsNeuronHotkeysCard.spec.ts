import SnsNeuronHotkeysCard from "$lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import * as snsNeuronsServices from "$lib/services/sns-neurons.services";
import { removeHotkey } from "$lib/services/sns-neurons.services";
import * as toastsStore from "$lib/stores/toasts.store";
import type { SelectedSnsNeuronStore } from "$lib/types/sns-neuron-detail.context";
import { enumValues } from "$lib/utils/enum.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import {
  SnsNeuronPermissionType,
  type SnsGovernanceDid,
} from "@icp-sdk/canisters/sns";
import { Principal } from "@icp-sdk/core/principal";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { writable } from "svelte/store";

describe("SnsNeuronHotkeysCard", () => {
  const addHotkeyPermissions = (key) => ({
    principal: [Principal.fromText(key)] as [Principal],
    permission_type: Int32Array.from([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
      ...HOTKEY_PERMISSIONS,
    ]),
  });
  const hotkeys = [
    "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe",
    "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae",
  ];
  const controlledNeuron: SnsGovernanceDid.Neuron = {
    ...mockSnsNeuron,
    permissions: [
      ...[...hotkeys].map(addHotkeyPermissions),
      {
        principal: [mockIdentity.getPrincipal()],
        permission_type: Int32Array.from(enumValues(SnsNeuronPermissionType)),
      },
    ],
  };

  const unControlledNeuron: SnsGovernanceDid.Neuron = {
    ...mockSnsNeuron,
    permissions: hotkeys.map(addHotkeyPermissions),
  };

  const reload = vi.fn();
  const props = {
    parameters: {
      ...snsNervousSystemParametersMock,
      neuron_grantable_permissions: [
        {
          permissions: Int32Array.from(HOTKEY_PERMISSIONS),
        },
      ],
    },
  };
  const renderCard = (neuron: SnsGovernanceDid.Neuron) =>
    renderSelectedSnsNeuronContext({
      reload,
      Component: SnsNeuronHotkeysCard,
      neuron,
      props,
    });

  // The reload writes `reloadedNeuron` to the store. The card reads the store
  // after the reload to check the removal.
  const renderCardWithReload = ({
    neuron,
    reloadedNeuron,
  }: {
    neuron: SnsGovernanceDid.Neuron;
    reloadedNeuron: SnsGovernanceDid.Neuron;
  }) => {
    const store = writable<SelectedSnsNeuronStore>({
      selected: {
        neuronIdHex: getSnsNeuronIdAsHexString(neuron),
        rootCanisterId: rootCanisterIdMock,
      },
      neuron,
    });
    const reloadWithStore = vi.fn().mockImplementation(async () => {
      store.update((value) => ({ ...value, neuron: reloadedNeuron }));
    });
    return renderSelectedSnsNeuronContext({
      reload: reloadWithStore,
      store,
      Component: SnsNeuronHotkeysCard,
      neuron,
      props,
    });
  };

  const permissionsFor = ({
    principal,
    permissions,
  }: {
    principal: string;
    permissions: SnsNeuronPermissionType[];
  }) => ({
    principal: [Principal.fromText(principal)] as [Principal],
    permission_type: Int32Array.from(permissions),
  });

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(snsNeuronsServices, "removeHotkey").mockResolvedValue({
      success: true,
    });
  });

  it("renders hotkeys title", () => {
    const { queryByText } = renderCard(controlledNeuron);

    expect(queryByText(en.neuron_detail.hotkeys_title)).toBeInTheDocument();
  });

  it("renders actions", () => {
    const { queryByTestId } = renderCard(controlledNeuron);

    expect(queryByTestId("add-hotkey-button")).toBeInTheDocument();
  });

  it("renders no actions if user not controller", () => {
    const { queryByTestId, queryAllByTestId } = renderCard(unControlledNeuron);

    expect(queryByTestId("add-hotkey-button")).toBeNull();
    expect(queryAllByTestId("remove-hotkey-button")).toHaveLength(0);
  });

  it("renders hotkeys", () => {
    const { queryByText } = renderCard(controlledNeuron);
    expect(queryByText(hotkeys[0])).toBeInTheDocument();
    expect(queryByText(hotkeys[1])).toBeInTheDocument();
  });

  it("can remove a hotkey and reload neuron with the update strategy", async () => {
    const { queryAllByTestId } = renderCard(controlledNeuron);

    const removeButtons = queryAllByTestId("remove-hotkey-button");
    fireEvent.click(removeButtons[0]);

    // Only the "update" strategy settles on the certified response. The card
    // checks the removal against that response.
    await waitFor(() => expect(reload).toBeCalledWith({ strategy: "update" }));
    expect(removeHotkey).toBeCalledWith({
      neuron: controlledNeuron,
      hotkey: hotkeys[0],
      rootCanisterId: expect.anything(),
    });
  });

  it("lists a principal that keeps only ManageVotingPermission", () => {
    const partialPrincipal = hotkeys[0];
    const neuron: SnsGovernanceDid.Neuron = {
      ...mockSnsNeuron,
      permissions: [
        {
          principal: [Principal.fromText(partialPrincipal)] as [Principal],
          permission_type: Int32Array.from([
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
          ]),
        },
        {
          principal: [mockIdentity.getPrincipal()],
          permission_type: Int32Array.from(enumValues(SnsNeuronPermissionType)),
        },
      ],
    };
    const { queryByText, queryByTestId } = renderCard(neuron);

    expect(queryByText(partialPrincipal)).toBeInTheDocument();
    expect(queryByTestId("partial-hotkey-warning")).toBeInTheDocument();
    expect(queryByTestId("partial-hotkey-warning").textContent.trim()).toBe(
      en.sns_neuron_detail.partial_hotkey_warning
    );
  });

  it("does not warn for a complete hotkey", () => {
    const { queryByTestId } = renderCard(controlledNeuron);

    expect(queryByTestId("partial-hotkey-warning")).toBeNull();
  });

  it("does not list the neuron controller as a partial hotkey", () => {
    const { queryByText } = renderCard(controlledNeuron);

    expect(queryByText(mockIdentity.getPrincipal().toText())).toBeNull();
  });

  it("shows an error when the removal leaves permissions behind", async () => {
    const spyToastsError = vi.spyOn(toastsStore, "toastsError");
    const { queryAllByTestId } = renderCard(controlledNeuron);

    const removeButtons = queryAllByTestId("remove-hotkey-button");
    fireEvent.click(removeButtons[0]);

    // `reload` is mocked, so the neuron in the store still has the
    // permissions. The card must report the incomplete removal.
    await waitFor(() => expect(spyToastsError).toBeCalledTimes(1));
    expect(spyToastsError).toBeCalledWith({
      labelKey: "error__sns.sns_remove_hotkey_incomplete",
    });
  });

  it("shows no error when the removal revokes every permission", async () => {
    const spyToastsError = vi.spyOn(toastsStore, "toastsError");
    const cleanNeuron: SnsGovernanceDid.Neuron = {
      ...controlledNeuron,
      permissions: [
        {
          principal: [mockIdentity.getPrincipal()],
          permission_type: Int32Array.from(enumValues(SnsNeuronPermissionType)),
        },
      ],
    };
    const { queryAllByTestId } = renderCardWithReload({
      neuron: controlledNeuron,
      reloadedNeuron: cleanNeuron,
    });

    const removeButtons = queryAllByTestId("remove-hotkey-button");
    fireEvent.click(removeButtons[0]);

    await waitFor(() => expect(removeHotkey).toBeCalled());
    await runResolvedPromises();

    expect(spyToastsError).not.toBeCalled();
  });

  it("shows confirmation modal if hotkey is the current user", async () => {
    const hotkeyNeuron: SnsGovernanceDid.Neuron = {
      ...mockSnsNeuron,
      permissions: [mockIdentity.getPrincipal().toText()].map(
        addHotkeyPermissions
      ),
    };
    const { queryAllByTestId, queryByTestId } = renderCard(hotkeyNeuron);

    const removeButtons = queryAllByTestId("remove-hotkey-button");
    await fireEvent.click(removeButtons[0]);

    await waitFor(() =>
      expect(
        queryByTestId("remove-current-user-hotkey-confirmation")
      ).toBeInTheDocument()
    );
    const confirmButton = queryByTestId("confirm-yes");
    confirmButton && fireEvent.click(confirmButton);

    await waitFor(() => expect(removeHotkey).toBeCalled());
  });

  describe("when the user removes its own hotkey", () => {
    const currentUser = mockIdentity.getPrincipal().toText();
    // The user holds the Community Fund combination. It can manage hotkeys and
    // the card lists it as a hotkey.
    const selfHotkeyNeuron: SnsGovernanceDid.Neuron = {
      ...mockSnsNeuron,
      permissions: [
        permissionsFor({
          principal: currentUser,
          permissions: [
            ...HOTKEY_PERMISSIONS,
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
          ],
        }),
      ],
    };

    const removeOwnHotkey = async ({
      queryAllByTestId,
      queryByTestId,
    }: {
      queryAllByTestId: (testId: string) => HTMLElement[];
      queryByTestId: (testId: string) => HTMLElement | null;
    }) => {
      const removeButtons = queryAllByTestId("remove-hotkey-button");
      await fireEvent.click(removeButtons[0]);

      await waitFor(() =>
        expect(
          queryByTestId("remove-current-user-hotkey-confirmation")
        ).toBeInTheDocument()
      );
      await fireEvent.click(queryByTestId("confirm-yes"));
      await waitFor(() => expect(removeHotkey).toBeCalled());
      await runResolvedPromises();
    };

    it("shows the success toast when the removal revokes every permission", async () => {
      const spyToastsShow = vi.spyOn(toastsStore, "toastsShow");
      const spyToastsError = vi.spyOn(toastsStore, "toastsError");
      const { queryAllByTestId, queryByTestId } = renderCardWithReload({
        neuron: selfHotkeyNeuron,
        reloadedNeuron: { ...selfHotkeyNeuron, permissions: [] },
      });

      await removeOwnHotkey({ queryAllByTestId, queryByTestId });

      expect(spyToastsShow).toBeCalledWith({
        level: "success",
        labelKey: "neurons.remove_hotkey_success",
      });
      expect(spyToastsError).not.toBeCalled();
    });

    it("shows an error and no success when a permission remains", async () => {
      const spyToastsShow = vi.spyOn(toastsStore, "toastsShow");
      const spyToastsError = vi.spyOn(toastsStore, "toastsError");
      // The removal left `ManageVotingPermission` behind. The user can grant
      // `Vote` and `SubmitProposal` back to itself, so the removal is not
      // complete.
      const { queryAllByTestId, queryByTestId } = renderCardWithReload({
        neuron: selfHotkeyNeuron,
        reloadedNeuron: {
          ...selfHotkeyNeuron,
          permissions: [
            permissionsFor({
              principal: currentUser,
              permissions: [
                SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
              ],
            }),
          ],
        },
      });

      await removeOwnHotkey({ queryAllByTestId, queryByTestId });

      expect(spyToastsError).toBeCalledWith({
        labelKey: "error__sns.sns_remove_hotkey_incomplete",
      });
      expect(spyToastsShow).not.toBeCalled();
    });
  });
});
