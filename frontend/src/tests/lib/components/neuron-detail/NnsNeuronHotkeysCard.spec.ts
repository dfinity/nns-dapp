import NnsNeuronHotkeysCard from "$lib/components/neuron-detail/NnsNeuronHotkeysCard.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import * as neuronsServices from "$lib/services/neurons.services";
import { removeHotkey } from "$lib/services/neurons.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronHotkeysCardPo } from "$tests/page-objects/NnsNeuronHotkeysCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

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
    vi.spyOn(neuronsServices, "removeHotkey").mockResolvedValue(10n);
    vi.spyOn(neuronsServices, "getNeuronFromStore").mockReturnValue(undefined);
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

  describe("link to the hotkeys of all neurons", () => {
    const renderCard = (neuron = controlledNeuron) => {
      const { container } = render(NeuronContextActionsTest, {
        props: {
          neuron,
          testComponent: NnsNeuronHotkeysCard,
        },
      });
      return NnsNeuronHotkeysCardPo.under(new JestPageObjectElement(container));
    };

    it("should render the link to the Hotkeys page", async () => {
      const linkPo = renderCard().getManageAllHotkeysLinkPo();

      expect(await linkPo.isPresent()).toBe(true);
      expect(await linkPo.getHref()).toBe(AppPath.Hotkeys);
    });

    it("should not render the link if the feature flag is disabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_HOTKEYS_PAGE", false);

      expect(await renderCard().getManageAllHotkeysLinkPo().isPresent()).toBe(
        false
      );
    });

    it("should not render the link if the user is not the controller", async () => {
      expect(
        await renderCard(unControlledNeuron)
          .getManageAllHotkeysLinkPo()
          .isPresent()
      ).toBe(false);
    });
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
