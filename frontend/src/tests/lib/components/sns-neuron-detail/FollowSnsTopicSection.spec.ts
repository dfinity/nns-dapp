/**
 * @jest-environment jsdom
 */
import FollowSnsTopicSection from "$lib/components/sns-neuron-detail/FollowSnsTopicSection.svelte";
import { removeFollowee } from "$lib/services/sns-neurons.services";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import type { SnsNeuron } from "@dfinity/sns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

jest.mock("$lib/services/sns-neurons.services", () => ({
  removeFollowee: jest.fn().mockReturnValue({ success: true }),
}));

describe("FollowSnsTopicSection", () => {
  const reload = jest.fn();
  const followee1 = createMockSnsNeuron({ id: [1, 2, 3] });
  const followee2 = createMockSnsNeuron({ id: [5, 6, 7] });
  const followees = [followee1.id[0], followee2.id[0]];
  const neuron: SnsNeuron = {
    ...mockSnsNeuron,
    followees: [[nervousSystemFunctionMock.id, { followees }]],
  };

  const renderComponent = (): RenderResult<SvelteComponent> =>
    renderSelectedSnsNeuronContext({
      Component: FollowSnsTopicSection,
      reload,
      neuron,
      props: {
        neuron,
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

  it("renders followees for that topic", () => {
    const { queryAllByTestId, getAllByText } = renderComponent();

    expect(queryAllByTestId("current-followee-item").length).toBe(
      followees.length
    );
    // Id appears as title and in the tooltip
    [followee1, followee2].forEach((followee) => {
      expect(
        getAllByText(
          shortenWithMiddleEllipsis(getSnsNeuronIdAsHexString(followee))
        ).length
      ).toBe(2);
    });
  });

  it("opens new followee modal", async () => {
    const { getByTestId, queryByTestId } = renderComponent();

    const button = getByTestId("open-new-followee-modal");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    await waitFor(() =>
      expect(queryByTestId("add-followee-button")).toBeInTheDocument()
    );
  });

  it("removes followee", async () => {
    const { queryAllByTestId } = renderComponent();

    const followeeElements = queryAllByTestId("current-followee-item");
    expect(followeeElements.length).toBe(followees.length);

    const followeeToRemove = followeeElements[0];
    const removeButton = followeeToRemove.querySelector("button");
    fireEvent.click(removeButton);

    await waitFor(() => expect(removeFollowee).toBeCalled());
  });
});
