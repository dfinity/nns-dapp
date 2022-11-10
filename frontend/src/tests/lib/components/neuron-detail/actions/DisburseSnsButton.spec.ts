/**
 * @jest-environment jsdom
 */

import DisburseSnsButton from "$lib/components/sns-neuron-detail/actions/DisburseSnsButton.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../../mocks/sns-neurons.mock";

describe("DisburseSnsButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", () => {
    const { getByText } = render(DisburseSnsButton, {
      props: {
        neuron: mockSnsNeuron,
        reloadContext: () => Promise.resolve(),
      },
    });

    expect(getByText(en.neuron_detail.disburse)).toBeInTheDocument();
  });

  it("opens sns modal", async () => {
    const { container, queryByTestId } = render(DisburseSnsButton, {
      props: {
        neuron: mockSnsNeuron,
        reloadContext: () => Promise.resolve(),
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("disburse-sns-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
