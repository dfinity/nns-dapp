import SnsNeuronHotkeysCard from "$lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { removeHotkey } from "$lib/services/sns-neurons.services";
import { authStore } from "$lib/stores/auth.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { enumValues } from "$lib/utils/enum.utils";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import en from "$tests/mocks/i18n.mock";
import {
  buildMockSnsParametersStore,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { fireEvent, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/sns-neurons.services", () => {
  return {
    removeHotkey: vi.fn().mockResolvedValue({ success: true }),
  };
});

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
  const controlledNeuron: SnsNeuron = {
    ...mockSnsNeuron,
    permissions: [
      ...[...hotkeys].map(addHotkeyPermissions),
      {
        principal: [mockIdentity.getPrincipal()],
        permission_type: Int32Array.from(enumValues(SnsNeuronPermissionType)),
      },
    ],
  };

  const unControlledNeuron: SnsNeuron = {
    ...mockSnsNeuron,
    permissions: hotkeys.map(addHotkeyPermissions),
  };

  const reload = vi.fn();
  const renderCard = (neuron: SnsNeuron) =>
    renderSelectedSnsNeuronContext({
      reload,
      Component: SnsNeuronHotkeysCard,
      neuron,
      props: {
        parameters: {
          ...snsNervousSystemParametersMock,
          neuron_grantable_permissions: [
            {
              permissions: Int32Array.from(HOTKEY_PERMISSIONS),
            },
          ],
        },
      },
    });

  beforeAll(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
    vi.spyOn(snsParametersStore, "subscribe").mockImplementation(
      buildMockSnsParametersStore()
    );
  });

  afterEach(() => vi.clearAllMocks());

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

  it("can remove a hotkey and reload neuron", async () => {
    const { queryAllByTestId } = renderCard(controlledNeuron);

    const removeButtons = queryAllByTestId("remove-hotkey-button");
    fireEvent.click(removeButtons[0]);

    await waitFor(() => expect(reload).toBeCalledWith());
    expect(removeHotkey).toBeCalled();
  });

  it("shows confirmation modal if hotkey is the current user", async () => {
    const hotkeyNeuron: SnsNeuron = {
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
});
