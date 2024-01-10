import NewSnsFolloweeModal from "$lib/modals/sns/neurons/NewSnsFolloweeModal.svelte";
import { addFollowee } from "$lib/services/sns-neurons.services";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

vi.mock("$lib/services/sns-neurons.services", () => {
  return {
    addFollowee: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("NewSnsFolloweeModal", () => {
  const reload = vi.fn();
  const functionId = 4n;

  const renderNewSnsFolloweeModal = (): RenderResult<SvelteComponent> =>
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

    const onClose = vi.fn();
    component.$on("nnsClose", onClose);
    buttonElement && (await fireEvent.click(buttonElement));
    expect(addFollowee).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
    expect(reload).toBeCalled();
  });
});
