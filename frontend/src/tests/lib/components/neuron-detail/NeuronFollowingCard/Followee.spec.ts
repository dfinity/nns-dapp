/**
 * @jest-environment jsdom
 */

import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { Topic } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import FolloweeTest from "./FolloweeTest.svelte";

describe("Followee", () => {
  const followee = {
    neuronId: BigInt(111),
    topics: [Topic.ExchangeRate, Topic.Governance, Topic.Kyc],
  };

  beforeEach(() => jest.spyOn(console, "error").mockImplementation(jest.fn));

  it("should render neuronId", () => {
    const { getByText } = render(FolloweeTest, {
      props: {
        followee,
      },
    });

    expect(getByText(followee.neuronId.toString())).toBeInTheDocument();
  });

  it("should render topics", () => {
    const { getByText } = render(FolloweeTest, {
      props: {
        followee,
      },
    });

    followee.topics.forEach((topic) =>
      expect(getByText(en.topics[Topic[topic]])).toBeInTheDocument()
    );
  });

  it("should render ids", () => {
    const { container } = render(FolloweeTest, {
      props: {
        followee,
      },
    });

    expect(container.querySelector("#followee-111")).toBeInTheDocument();
    expect(
      container.querySelector('[aria-labelledby="followee-111"]')
    ).toBeInTheDocument();
  });

  it("should open modal", async () => {
    const { container, getByTestId } = render(FolloweeTest, {
      props: {
        followee,
      },
    });

    await fireEvent.click(container.querySelector("button") as Element);
    expect(getByTestId("voting-history-modal")).toBeInTheDocument();
  });

  it("should render known neurons name", async () => {
    const { getByText } = render(FolloweeTest, {
      props: {
        followee,
      },
    });

    knownNeuronsStore.setNeurons([
      {
        id: followee.neuronId,
        name: "test-name",
        description: "test-description",
      },
    ]);
    await waitFor(() => expect(getByText("test-name")).toBeInTheDocument());
  });
});
