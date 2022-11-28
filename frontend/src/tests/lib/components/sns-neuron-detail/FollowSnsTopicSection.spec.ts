/**
 * @jest-environment jsdom
 */
import FollowSnsTopicSection from "$lib/components/sns-neuron-detail/FollowSnsTopicSection.svelte";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import { nervousSystemFunctionMock } from "../../../mocks/sns-functions.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";
import { principal } from "../../../mocks/sns-projects.mock";

describe("FollowSnsTopicSection", () => {
  const reload = jest.fn();

  const renderComponent = (): RenderResult =>
    renderSelectedSnsNeuronContext({
      Component: FollowSnsTopicSection,
      reload,
      neuron: mockSnsNeuron,
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: principal(2),
        nsFunction: nervousSystemFunctionMock,
      },
    });

  it("renders follow topic section", () => {
    const { queryByTestId } = renderComponent();

    expect(
      queryByTestId(`follow-topic-${nervousSystemFunctionMock.id}-section`)
    ).toBeInTheDocument();
  });

  it.only("opens new followee modal", async () => {
    const { getByTestId, queryByTestId } = renderComponent();

    const button = getByTestId("open-new-followee-modal");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    await waitFor(() =>
      expect(queryByTestId("add-followee-button")).toBeInTheDocument()
    );
  });
});
