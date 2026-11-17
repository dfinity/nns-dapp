import SnsNeuronHotkeysCard from "$lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import * as snsNeuronsServices from "$lib/services/sns-neurons.services";
import { removeHotkey } from "$lib/services/sns-neurons.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { enumValues } from "$lib/utils/enum.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronHotkeysCardPo } from "$tests/page-objects/SnsNeuronHotkeysCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  SnsNeuronPermissionType,
  type SnsGovernanceDid,
} from "@icp-sdk/canisters/sns";
import { Principal } from "@icp-sdk/core/principal";
import { fireEvent, waitFor } from "@testing-library/svelte";

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
  const renderCard = (neuron: SnsGovernanceDid.Neuron) =>
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

  describe("link to the hotkeys of all neurons", () => {
    const renderCardPo = (neuron: SnsGovernanceDid.Neuron) => {
      const { container } = renderCard(neuron);
      return SnsNeuronHotkeysCardPo.under(new JestPageObjectElement(container));
    };

    it("should render the link to the Hotkeys page", async () => {
      const linkPo = renderCardPo(controlledNeuron).getManageAllHotkeysLinkPo();

      expect(await linkPo.isPresent()).toBe(true);
      expect(await linkPo.getHref()).toBe(AppPath.Hotkeys);
    });

    it("should not render the link if the feature flag is disabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_HOTKEYS_PAGE", false);

      expect(
        await renderCardPo(controlledNeuron)
          .getManageAllHotkeysLinkPo()
          .isPresent()
      ).toBe(false);
    });

    it("should not render the link if the user cannot manage hotkeys", async () => {
      expect(
        await renderCardPo(unControlledNeuron)
          .getManageAllHotkeysLinkPo()
          .isPresent()
      ).toBe(false);
    });
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
});
