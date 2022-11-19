/**
 * @jest-environment jsdom
 */

import FollowSnsNeuronsModal from "$lib/modals/sns/FollowSnsNeuronsModal.svelte";
import { render } from "@testing-library/svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

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
});
