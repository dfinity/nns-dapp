import SplitSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/SplitSnsNeuronButton.svelte";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { openSnsNeuronModal } from "$lib/utils/modals.utils";
import { minNeuronSplittable } from "$lib/utils/sns-neuron.utils";
import { formatToken } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/utils/modals.utils", () => ({
  openSnsNeuronModal: vi.fn(),
}));

describe("SplitSnsNeuronButton", () => {
  const transactionFee = 100n;
  const neuronMinimumStake = 100_000_000n;
  const props = {
    neuron: {
      ...mockSnsNeuron,
      stake: neuronMinimumStake * 2n,
    },
    parameters: {
      ...snsNervousSystemParametersMock,
      neuron_minimum_stake_e8s: [neuronMinimumStake] as [bigint],
    },
    transactionFee,
    token: mockToken,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should display enabled button", async () => {
    const { getByTestId } = render(SplitSnsNeuronButton, {
      props,
    });

    const button = getByTestId("split-neuron-button");
    expect(button).toBeInTheDocument();
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should display disabled button when neuron is vesting", async () => {
    const { getByTestId } = render(SplitSnsNeuronButton, {
      props: {
        ...props,
        neuron: createMockSnsNeuron({
          id: [1],
          vesting: true,
        }),
      },
    });

    const button = getByTestId("split-neuron-button");
    expect(button).toBeInTheDocument();
    expect(button.hasAttribute("disabled")).toBe(true);
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
    const { getByText, queryByTestId } = render(SplitSnsNeuronButton, {
      props: {
        ...props,
        neuron: createMockSnsNeuron({
          id: [1],
          vesting: true,
          stake: neuronMinimumStake - 10_000n,
        }),
      },
    });

    const button = queryByTestId("split-neuron-button");
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
