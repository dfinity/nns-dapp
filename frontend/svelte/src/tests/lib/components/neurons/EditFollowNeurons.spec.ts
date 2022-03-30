/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import EditFollowNeurons from "../../../../lib/components/neurons/EditFollowNeurons.svelte";
import { authStore } from "../../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    removeFollowee: jest.fn(),
    addFollowee: jest.fn(),
  };
});

jest.mock("../../../../lib/services/knownNeurons.services", () => {
  return {
    listKnownNeurons: jest.fn(),
  };
});

describe("EditFollowNeurons", () => {
  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("renders list of topics", () => {
    const { queryAllByTestId } = render(EditFollowNeurons, {
      props: { neuron: mockNeuron },
    });

    const elements = queryAllByTestId("follow-topic-section");

    expect(elements.length).toBeGreaterThan(1);
  });

  it("opens a topic", async () => {
    const { queryAllByTestId } = render(EditFollowNeurons, {
      props: { neuron: mockNeuron },
    });

    const topicElements = queryAllByTestId("follow-topic-section");

    const firstTopicElement = topicElements[0];
    expect(firstTopicElement).not.toBeNull();

    const followingElement = firstTopicElement.querySelector(
      '[data-tid="follow-topic-section-current"]'
    );

    expect(followingElement).not.toBeNull();
    if (followingElement !== null) {
      expect(followingElement).not.toBeVisible();
    }

    const openTopicIcon = firstTopicElement.querySelector(
      "[data-tid='expand-topic-followees']"
    );

    expect(openTopicIcon).not.toBeNull();
    openTopicIcon && (await fireEvent.click(openTopicIcon));

    expect(followingElement).not.toBeNull();
    if (followingElement !== null) {
      expect(followingElement).toBeVisible();
    }
  });

  it("a topic can open the NewFollowee Modal", async () => {
    const { queryAllByTestId, queryByTestId } = render(EditFollowNeurons, {
      props: { neuron: mockNeuron },
    });

    const topicElements = queryAllByTestId("follow-topic-section");

    const firstTopicElement = topicElements[0];
    expect(firstTopicElement).not.toBeNull();

    const followingElement = firstTopicElement.querySelector(
      '[data-tid="follow-topic-section-current"]'
    );

    expect(followingElement).not.toBeNull();
    if (followingElement !== null) {
      expect(followingElement).not.toBeVisible();
    }

    const openTopicIcon = firstTopicElement.querySelector(
      "[data-tid='expand-topic-followees']"
    );

    expect(openTopicIcon).not.toBeNull();
    openTopicIcon && (await fireEvent.click(openTopicIcon));

    expect(followingElement).not.toBeNull();
    if (followingElement !== null) {
      expect(followingElement).toBeVisible();
    }

    const openNewFolloweeButton = firstTopicElement.querySelector(
      '[data-tid="open-new-followee-modal"]'
    );

    expect(openNewFolloweeButton).not.toBeNull();
    openNewFolloweeButton && (await fireEvent.click(openNewFolloweeButton));

    await waitFor(() =>
      expect(queryByTestId("new-followee-modal")).toBeInTheDocument()
    );
  });
});
