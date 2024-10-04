import NnsNeuronHotkeysCard from "$lib/components/neuron-detail/NnsNeuronHotkeysCard.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { removeHotkey } from "$lib/services/neurons.services";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    removeHotkey: vi.fn().mockResolvedValue(10n),
    getNeuronFromStore: vi.fn(),
  };
});

describe("NnsNeuronHotkeysCard", () => {
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

  beforeEach(() => {
    resetIdentity();
    vi.clearAllMocks();
  });

  it("renders hotkeys title", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: controlledNeuron,
        testComponent: NnsNeuronHotkeysCard,
      },
    });

    expect(queryByText(en.neuron_detail.hotkeys_title)).toBeInTheDocument();
  });

  it("renders actions", () => {
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: controlledNeuron,
        testComponent: NnsNeuronHotkeysCard,
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
          testComponent: NnsNeuronHotkeysCard,
        },
      }
    );

    expect(queryByTestId("add-hotkey-button")).toBeNull();
    expect(queryAllByTestId("remove-hotkey-button")).toHaveLength(0);
  });

  it("renders add hotkey description when no hotkeys and user can add a hotkey", () => {
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...controlledNeuron,
          fullNeuron: {
            ...controlledNeuron.fullNeuron,
            hotKeys: [],
          },
        },
        testComponent: NnsNeuronHotkeysCard,
      },
    });

    expect(queryByTestId("add-hotkey-description")).toBeInTheDocument();
    expect(queryByTestId("no-hotkey")).toBeNull();
  });

  it("renders no-hotkey message when no hotkeys and user can not add a hotkey", () => {
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...unControlledNeuron,
          fullNeuron: {
            ...unControlledNeuron.fullNeuron,
            hotKeys: [],
          },
        },
        testComponent: NnsNeuronHotkeysCard,
      },
    });

    expect(queryByTestId("add-hotkey-description")).toBeNull();
    expect(queryByTestId("no-hotkey")).toBeInTheDocument();
  });

  it("renders hotkeys", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: controlledNeuron,
        testComponent: NnsNeuronHotkeysCard,
      },
    });

    expect(queryByText(hotKeys[0])).toBeInTheDocument();
    expect(queryByText(hotKeys[1])).toBeInTheDocument();
  });

  it("user can remove a hotkey", async () => {
    const { queryAllByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: controlledNeuron,
        testComponent: NnsNeuronHotkeysCard,
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

    const { queryAllByTestId, queryByTestId } = render(
      NeuronContextActionsTest,
      {
        props: {
          neuron,
          testComponent: NnsNeuronHotkeysCard,
        },
      }
    );

    const removeButtons = queryAllByTestId("remove-hotkey-button");
    expect(removeButtons.length).toBeGreaterThan(0);

    const firstButton = removeButtons[0];

    await fireEvent.click(firstButton);

    await waitFor(() =>
      expect(
        queryByTestId("remove-current-user-hotkey-confirmation")
      ).toBeInTheDocument()
    );
    const confirmButton = queryByTestId("confirm-yes");
    expect(removeHotkey).not.toBeCalled();
    confirmButton && fireEvent.click(confirmButton);
    expect(removeHotkey).toBeCalled();

    await waitFor(() => expect(get(pageStore).path).toEqual(AppPath.Neurons));
  });
});
