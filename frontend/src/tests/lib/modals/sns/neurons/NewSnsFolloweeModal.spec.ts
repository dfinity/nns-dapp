import NewSnsFolloweeModal from "$lib/modals/sns/neurons/NewSnsFolloweeModal.svelte";
import * as snsNeuronsServices from "$lib/services/sns-neurons.services";
import { addFollowee } from "$lib/services/sns-neurons.services";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { Component } from "svelte";

describe("NewSnsFolloweeModal", () => {
  const reload = vi.fn();
  const functionId = 4n;

  beforeEach(() => {
    vi.spyOn(snsNeuronsServices, "addFollowee").mockResolvedValue({
      success: true,
    });
  });

  const renderNewSnsFolloweeModal = (
    events?: Record<string, ($event: CustomEvent) => void>
  ): RenderResult<Component> =>
    renderSelectedSnsNeuronContext({
      Component: NewSnsFolloweeModal,
      reload,
      neuron: mockSnsNeuron,
      props: {
        rootCanisterId: principal(2),
        neuron: mockSnsNeuron,
        functionId,
      },
      events,
    });

  it("should display modal", async () => {
    const { container } = renderNewSnsFolloweeModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should call addFollowee service, reload and close modal", async () => {
    const followeeHex = subaccountToHexString(
      arrayOfNumberToUint8Array([1, 2, 4])
    );
    const onClose = vi.fn();

    const { container, queryByTestId } = renderNewSnsFolloweeModal({
      nnsClose: onClose,
    });

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: followeeHex },
      }));

    const buttonElement = queryByTestId("add-followee-button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));
    expect(addFollowee).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
    expect(reload).toBeCalled();
  });
});
