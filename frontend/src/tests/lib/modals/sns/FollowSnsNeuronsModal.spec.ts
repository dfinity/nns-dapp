/**
 * @jest-environment jsdom
 */

import FollowSnsNeuronsModal from "$lib/modals/sns/neurons/FollowSnsNeuronsModal.svelte";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { render, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import en from "../../../mocks/i18n.mock";
import { nervousSystemFunctionMock } from "../../../mocks/sns-functions.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

describe("FollowSnsNeuronsModal", () => {
  const neuron = {
    ...mockSnsNeuron,
  };
  const rootCanisterId = mockPrincipal;
  const reload = jest.fn();

  const renderNewSnsFolloweeModal = (): RenderResult<SvelteComponent> =>
    renderSelectedSnsNeuronContext({
      Component: FollowSnsNeuronsModal,
      reload,
      neuron,
      props: {
        rootCanisterId,
        neuron,
      },
    });

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
    const { queryByTestId } = renderNewSnsFolloweeModal();
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
      nsFunctions: [function0, function1, function2],
      certified: true,
    });
    const { queryByTestId } = renderNewSnsFolloweeModal();

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
