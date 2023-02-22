/**
 * @jest-environment jsdom
 */

import DisburseSnsButton from "$lib/components/sns-neuron-detail/actions/DisburseSnsButton.svelte";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { fireEvent, render } from "@testing-library/svelte";
import { mockPrincipal } from "../../../../mocks/auth.store.mock";
import en from "../../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../../mocks/sns-neurons.mock";
import { mockTokenStore } from "../../../../mocks/sns-projects.mock";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("DisburseSnsButton", () => {
  beforeAll(() =>
    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore)
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", () => {
    const { getByText } = render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
        testComponent: DisburseSnsButton,
      },
    });

    expect(getByText(en.neuron_detail.disburse)).toBeInTheDocument();
  });

  it("opens sns modal", async () => {
    const { container, queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
        testComponent: DisburseSnsButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("disburse-sns-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
