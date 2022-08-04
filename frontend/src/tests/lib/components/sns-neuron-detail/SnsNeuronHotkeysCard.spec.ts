/**
 * @jest-environment jsdom
 */

import { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import SnsNeuronHotkeysCard from "../../../../lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
import { authStore } from "../../../../lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

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

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  it("renders hotkeys title", () => {
    const { queryByText } = render(SnsNeuronHotkeysCard, {
      props: { neuron: controlledNeuron },
    });

    expect(queryByText(en.neuron_detail.hotkeys_title)).toBeInTheDocument();
  });

  it("renders actions", () => {
    const { queryByTestId } = render(SnsNeuronHotkeysCard, {
      props: { neuron: controlledNeuron },
    });

    expect(queryByTestId("add-hotkey-button")).toBeInTheDocument();
  });

  it("renders no actions if user not controller", () => {
    const { queryByTestId, queryAllByTestId } = render(SnsNeuronHotkeysCard, {
      props: { neuron: unControlledNeuron },
    });

    expect(queryByTestId("add-hotkey-button")).toBeNull();
    expect(queryAllByTestId("remove-hotkey-button")).toHaveLength(0);
  });

  it("renders hotkeys", () => {
    const { queryByText } = render(SnsNeuronHotkeysCard, {
      props: { neuron: controlledNeuron },
    });
    expect(queryByText(hotkeys[0])).toBeInTheDocument();
    expect(queryByText(hotkeys[1])).toBeInTheDocument();
  });
});
