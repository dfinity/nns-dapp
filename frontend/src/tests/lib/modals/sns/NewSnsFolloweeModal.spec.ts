/**
 * @jest-environment jsdom
 */

import NewSnsFolloweeModal from "$lib/modals/sns/NewSnsFolloweeModal.svelte";
import { addFollowee } from "$lib/services/sns-neurons.services";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";
import { principal } from "../../../mocks/sns-projects.mock";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    addFollowee: jest.fn().mockResolvedValue(undefined),
  };
});

describe("NewSnsFolloweeModal", () => {
  const reload = jest.fn();
  const functionId = BigInt(4);

  const renderNewSnsFolloweeModal = (): RenderResult =>
    renderSelectedSnsNeuronContext({
      Component: NewSnsFolloweeModal,
      reload,
      neuron: mockSnsNeuron,
      props: {
        rootCanisterId: principal(2),
        neuron: mockSnsNeuron,
        functionId,
      },
    });

  it("should display modal", async () => {
    const { container } = renderNewSnsFolloweeModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should call addFollowee service, reload and close modal", async () => {
    const followeeHex = subaccountToHexString(
      arrayOfNumberToUint8Array([1, 2, 4])
    );
    const { container, queryByTestId, component } = renderNewSnsFolloweeModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: followeeHex },
      }));

    const buttonElement = queryByTestId("add-followee-button");
    expect(buttonElement).not.toBeNull();

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);
    buttonElement && (await fireEvent.click(buttonElement));
    expect(addFollowee).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
    expect(reload).toBeCalled();
  });
});
