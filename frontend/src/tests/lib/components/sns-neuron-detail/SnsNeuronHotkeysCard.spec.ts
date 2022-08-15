/**
 * @jest-environment jsdom
 */

import { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { fireEvent, waitFor } from "@testing-library/svelte";
import SnsNeuronHotkeysCard from "../../../../lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
import { removeHotkey } from "../../../../lib/services/sns-neurons.services";
import { authStore } from "../../../../lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

jest.mock("../../../../lib/services/sns-neurons.services", () => {
  return {
    removeHotkey: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsNeuronHotkeysCard", () => {
  const addVotePermission = (key) => ({
    principal: [Principal.fromText(key)] as [Principal],
    permission_type: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
  });
  const hotkeys = [
    "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe",
    "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae",
  ];
  const controlledNeuron: SnsNeuron = {
    ...mockSnsNeuron,
    permissions: [...hotkeys, mockIdentity.getPrincipal().toText()].map(
      addVotePermission
    ),
  };

  const unControlledNeuron: SnsNeuron = {
    ...mockSnsNeuron,
    permissions: hotkeys.map(addVotePermission),
  };

  const reload = jest.fn();
  const renderCard = (neuron: SnsNeuron) =>
    renderSelectedSnsNeuronContext({
      reload,
      Component: SnsNeuronHotkeysCard,
      neuron,
    });

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  afterEach(() => jest.clearAllMocks());

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

    expect(removeHotkey).toBeCalled();
    await waitFor(() => expect(reload).toBeCalledWith({ forceFetch: true }));
  });
});
