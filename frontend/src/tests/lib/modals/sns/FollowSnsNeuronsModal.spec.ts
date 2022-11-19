/**
 * @jest-environment jsdom
 */

import FollowSnsNeuronsModal from "$lib/modals/sns/FollowSnsNeuronsModal.svelte";
import { loadSnsTopics } from "$lib/services/sns-neurons.services";
import { render, waitFor } from "@testing-library/svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    loadSnsTopics: jest.fn().mockResolvedValue(undefined),
  };
});

describe("FollowSnsNeuronsModal", () => {
  it("should display modal", async () => {
    const { container } = render(FollowSnsNeuronsModal, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
      },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should load sns topics", async () => {
    render(FollowSnsNeuronsModal, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
      },
    });

    await waitFor(() => expect(loadSnsTopics).toBeCalledWith(mockPrincipal));
  });
});
