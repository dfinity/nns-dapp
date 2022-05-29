/**
 * @jest-environment jsdom
 */

import { Topic } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import Followee from "../../../../../lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
import { knownNeuronsStore } from "../../../../../lib/stores/knownNeurons.store";
import en from "../../../../mocks/i18n.mock";

describe("Followee", () => {
  const followee = {
    neuronId: BigInt(111),
    topics: [Topic.ExchangeRate, Topic.Governance, Topic.Kyc],
  };
  const props = {
    followee,
  };

  beforeEach(() => jest.spyOn(console, "error").mockImplementation(jest.fn));

  it("should render neuronId", () => {
    const { getByText } = render(Followee, { props });
    expect(getByText(followee.neuronId.toString())).toBeInTheDocument();
  });

  it("should render topics", () => {
    const { getByText } = render(Followee, { props });
    followee.topics.forEach((topic) =>
      expect(getByText(en.topics[Topic[topic]])).toBeInTheDocument()
    );
  });

  it("should render ids", () => {
    const { container } = render(Followee, { props });
    expect(container.querySelector("#followee-111")).toBeInTheDocument();
    expect(
      container.querySelector('[aria-labelledby="followee-111"]')
    ).toBeInTheDocument();
  });

  it("should open modal", async () => {
    const { container, getByTestId } = render(Followee, { props });
    await fireEvent.click(container.querySelector("button") as Element);
    expect(getByTestId("voting-history-modal")).toBeInTheDocument();
  });

  it("should render known neurons name", async () => {
    const { getByText } = render(Followee, { props });
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
