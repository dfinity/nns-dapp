/**
 * @jest-environment jsdom
 */

import FollowSnsNeuronsButton from "$lib/components/sns-neuron-detail/actions/FollowSnsNeuronsButton.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { mockPrincipal } from "../../../../mocks/auth.store.mock";
import en from "../../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../../mocks/sns-neurons.mock";

jest.mock("../../../../../lib/services/sns-neurons.services", () => {
  return {
    loadSnsTopics: jest.fn(),
  };
});

describe("FollowSnsNeuronsButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders Follow Neurons message", () => {
    const { getByText } = render(FollowSnsNeuronsButton, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
      },
    });

    expect(getByText(en.neuron_detail.follow_neurons)).toBeInTheDocument();
  });

  it("opens Add Hotkey Neuron Modal", async () => {
    const { container, queryByTestId } = render(FollowSnsNeuronsButton, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("follow-sns-neurons-modal");
    expect(modal).toBeInTheDocument();
  });
});
