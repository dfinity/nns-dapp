/**
 * @jest-environment jsdom
 */

import NeuronHotkeysCard from "$lib/components/neuron-detail/NeuronHotkeysCard.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { removeHotkey } from "$lib/services/neurons.services";
import { authStore } from "$lib/stores/auth.store";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

jest.mock("$lib/services/neurons.services", () => {
  return {
    removeHotkey: jest.fn().mockResolvedValue(BigInt(10)),
    getNeuronFromStore: jest.fn(),
  };
});

describe("NeuronHotkeysCard", () => {
  const hotKeys = [
    "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe",
    "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae",
  ];
  const controlledNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
      hotKeys,
    },
  };

  const unControlledNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: "not-controlled",
    },
  };

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  it("renders hotkeys title", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: controlledNeuron,
        testComponent: NeuronHotkeysCard,
      },
    });

    expect(queryByText(en.neuron_detail.hotkeys_title)).toBeInTheDocument();
  });

  it("renders actions", () => {
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: controlledNeuron,
        testComponent: NeuronHotkeysCard,
      },
    });

    expect(queryByTestId("add-hotkey-button")).toBeInTheDocument();
  });

  it("renders no actions if user not controller", () => {
    const { queryByTestId, queryAllByTestId } = render(
      NeuronContextActionsTest,
      {
        props: {
          neuron: unControlledNeuron,
          testComponent: NeuronHotkeysCard,
        },
      }
    );

    expect(queryByTestId("add-hotkey-button")).toBeNull();
    expect(queryAllByTestId("remove-hotkey-button")).toHaveLength(0);
  });

  it("renders hotkeys", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: controlledNeuron,
        testComponent: NeuronHotkeysCard,
      },
    });

    expect(queryByText(hotKeys[0])).toBeInTheDocument();
    expect(queryByText(hotKeys[1])).toBeInTheDocument();
  });

  it("user can remove a hotkey", async () => {
    const { queryAllByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: controlledNeuron,
        testComponent: NeuronHotkeysCard,
      },
    });

    const removeButtons = queryAllByTestId("remove-hotkey-button");
    expect(removeButtons.length).toBeGreaterThan(0);

    const firstButton = removeButtons[0];

    await fireEvent.click(firstButton);
    expect(removeHotkey).toBeCalled();
  });

  it("user is redirected if it removes itself from hotkeys", async () => {
    const neuron = {
      ...controlledNeuron,
      fullNeuron: {
        ...controlledNeuron.fullNeuron,
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    };

    const { queryAllByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronHotkeysCard,
      },
    });

    const removeButtons = queryAllByTestId("remove-hotkey-button");
    expect(removeButtons.length).toBeGreaterThan(0);

    const firstButton = removeButtons[0];

    await fireEvent.click(firstButton);
    expect(removeHotkey).toBeCalled();

    await waitFor(() => expect(get(pageStore).path).toEqual(AppPath.Neurons));
  });
});
