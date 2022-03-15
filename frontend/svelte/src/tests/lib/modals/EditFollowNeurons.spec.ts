/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import EditFollowNeurons from "../../../lib/modals/neurons/EditFollowNeurons.svelte";

describe("EditFollowNeurons", () => {
  it("renders list of topics", () => {
    const { queryAllByTestId } = render(EditFollowNeurons);

    const elements = queryAllByTestId("follow-topic-section");

    expect(elements.length).toBeGreaterThan(1);
  });

  it("opens a topic", async () => {
    const { queryAllByTestId } = render(EditFollowNeurons);

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
    const { queryAllByTestId, queryByTestId } = render(EditFollowNeurons);

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
