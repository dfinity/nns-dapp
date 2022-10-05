/**
 * @jest-environment jsdom
 */

import ConfirmDisburseNeuron from "$lib/components/neuron-detail/ConfirmDisburseNeuron.svelte";
import { formattedTransactionFeeICP } from "$lib/utils/icp.utils";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

jest.mock("$lib/services/neurons.services", () => {
  return {
    disburse: jest.fn().mockResolvedValue({ success: true }),
    getNeuronFromStore: jest.fn(),
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
    const { getByTestId, getByText } = render(ConfirmDisburseNeuron, {
      props,
    });

    expect(getByTestId("token-value")).not.toBeNull();
    expect(getByText(amount)).not.toBeNull();
  });

  it("should transaction info", async () => {
    const { getByText } = render(ConfirmDisburseNeuron, {
      props,
    });
    const feeValue = BigInt(Math.floor(fee * 1e8));

    expect(getByText(props.source)).not.toBeNull();
    expect(getByText(props.destinationAddress)).not.toBeNull();
    expect(getByText(formattedTransactionFeeICP(feeValue))).not.toBeNull();
  });

  it("should display spinner", async () => {
    const { getByTestId } = render(ConfirmDisburseNeuron, {
      props: {
        ...props,
        loading: true,
      },
    });

    expect(getByTestId("spinner")).not.toBeNull();
  });
});
