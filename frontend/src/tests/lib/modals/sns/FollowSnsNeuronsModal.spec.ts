/**
 * @jest-environment jsdom
 */

import FollowSnsNeuronsModal from "$lib/modals/sns/FollowSnsNeuronsModal.svelte";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { nervousSystemFunctionMock } from "../../../mocks/sns-functions.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

describe("FollowSnsNeuronsModal", () => {
  const neuron = {
    ...mockSnsNeuron,
  };
  const rootCanisterId = mockPrincipal;

  afterEach(() => {
    snsFunctionsStore.reset();
  });
  it("renders title", () => {
    const { queryByText } = render(FollowSnsNeuronsModal, {
      props: {
        neuron,
        rootCanisterId,
      },
    });

    expect(queryByText(en.neurons.follow_neurons_screen)).toBeInTheDocument();
  });

  it("renders spinner if no functions to follow", () => {
    const { queryByTestId } = render(FollowSnsNeuronsModal, {
      props: {
        neuron,
        rootCanisterId,
      },
    });
    expect(queryByTestId("spinner")).toBeInTheDocument();
  });

  it("displays the functions to follow", () => {
    const function0: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(0),
    };
    const function1: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(1),
    };
    const function2: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(2),
    };
    snsFunctionsStore.setFunctions({
      rootCanisterId,
      functions: [function0, function1, function2],
    });
    const { queryByTestId } = render(FollowSnsNeuronsModal, {
      props: {
        neuron,
        rootCanisterId,
      },
    });

    expect(
      queryByTestId(`follow-topic-${function0.id}-section`)
    ).not.toBeInTheDocument();
    expect(
      queryByTestId(`follow-topic-${function1.id}-section`)
    ).toBeInTheDocument();
    expect(
      queryByTestId(`follow-topic-${function2.id}-section`)
    ).toBeInTheDocument();
  });
});
