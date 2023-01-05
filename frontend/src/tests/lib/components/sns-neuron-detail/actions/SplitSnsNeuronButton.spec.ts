/**
 * @jest-environment jsdom
 */

import SplitSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/SplitSnsNeuronButton.svelte";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { openSnsNeuronModal } from "$lib/utils/modals.utils";
import { minNeuronSplittable } from "$lib/utils/sns-neuron.utils";
import { formatToken } from "$lib/utils/token.utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mockPrincipal } from "../../../../mocks/auth.store.mock";
import en from "../../../../mocks/i18n.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "../../../../mocks/sns-neurons.mock";
import { mockToken } from "../../../../mocks/sns-projects.mock";

jest.mock("$lib/utils/modals.utils", () => ({
  openSnsNeuronModal: jest.fn(),
}));

let canBeSplit = true;
jest.mock("$lib/utils/sns-neuron.utils", () => ({
  ...jest.requireActual("$lib/utils/sns-neuron.utils"),
  neuronCanBeSplit: () => canBeSplit,
  minNeuronSplittable: () => 0n,
}));

describe("SplitSnsNeuronButton", () => {
  const transactionFee = 100n;
  const neuronMinimumStake = 0n;
  const props = {
    neuron: {
      ...mockSnsNeuron,
    },
    rootCanisterId: mockPrincipal,
    parameters: {
      ...snsNervousSystemParametersMock,
      neuron_minimum_stake_e8s: [neuronMinimumStake],
    },
    transactionFee,
    token: mockToken,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should display enabled button", async () => {
    const { getByTestId } = render(SplitSnsNeuronButton, {
      props,
    });

    const button = getByTestId("split-neuron-button");
    expect(button).toBeInTheDocument();
    expect(button.hasAttribute("disabled")).toBeFalsy();
  });

  it("should open split neuron modal", async () => {
    const { getByTestId } = render(SplitSnsNeuronButton, {
      props,
    });

    fireEvent.click(getByTestId("split-neuron-button") as HTMLButtonElement);

    await waitFor(() =>
      expect(openSnsNeuronModal).toBeCalledWith(
        expect.objectContaining({
          type: "split-neuron",
        })
      )
    );
  });

  it("should display tooltip and disabled button when neuron can't be split", async () => {
    canBeSplit = false;

    const { getByText, container, queryByTestId } = render(
      SplitSnsNeuronButton,
      {
        props,
      }
    );

    expect(queryByTestId("split-neuron-button")).toBeNull();

    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.hasAttribute("disabled")).toBeTruthy();

    const tooltip = replacePlaceholders(
      en.neuron_detail.split_neuron_disabled_tooltip,
      {
        $amount: formatToken({
          value: minNeuronSplittable({
            fee: transactionFee,
            neuronMinimumStake,
          }),
          detailed: true,
        }),
        $token: mockToken.symbol,
      }
    );

    expect(
      getByText(tooltip, { exact: false, trim: true })
    ).toBeInTheDocument();
  });
});
