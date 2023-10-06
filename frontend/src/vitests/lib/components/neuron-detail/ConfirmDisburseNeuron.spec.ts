import { formattedTransactionFeeICP } from "$lib/utils/token.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import ConfirmDisburseNeuronTest from "./ConfirmDisburseNeuronTest.svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    disburse: vi.fn().mockResolvedValue({ success: true }),
    getNeuronFromStore: vi.fn(),
  };
});

describe("ConfirmDisburseNeuron", () => {
  const amount = 6.66;
  const fee = 1.11;
  const props = {
    amount: TokenAmount.fromNumber({ amount, token: ICPToken }),
    source: "test source",
    destinationAddress: "test destination",
    loading: false,
    fee: TokenAmount.fromNumber({ amount: fee, token: ICPToken }),
  };

  it("should display amount", async () => {
    const { getByTestId, getByText } = render(ConfirmDisburseNeuronTest, {
      props: {
        neuron: mockNeuron,
        props,
      },
    });

    expect(getByTestId("token-value")).not.toBeNull();
    expect(getByText(amount)).not.toBeNull();
  });

  it("should transaction info", async () => {
    const { getByText } = render(ConfirmDisburseNeuronTest, {
      props: {
        neuron: mockNeuron,
        props,
      },
    });

    const feeValue = BigInt(Math.floor(fee * 1e8));

    expect(getByText(props.source)).not.toBeNull();
    expect(getByText(props.destinationAddress)).not.toBeNull();
    expect(getByText(formattedTransactionFeeICP(feeValue))).not.toBeNull();
  });

  it("should disable action on loading", async () => {
    const { getByTestId } = render(ConfirmDisburseNeuronTest, {
      props: {
        neuron: mockNeuron,
        props: {
          ...props,
          loading: true,
        },
      },
    });

    expect(
      getByTestId("disburse-neuron-button").getAttribute("disabled")
    ).not.toBeNull();
  });
});
