/**
 * @jest-environment jsdom
 */

import { ICPToken, TokenAmount } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
// import ConfirmDisburseNeuron from "../../../../lib/components/neurons-detail/ConfirmDisburseNeuron.svelte";
import ConfirmDisburseNeuron from "../../../../lib/components/neuron-detail/ConfirmDisburseNeuron.svelte";
import { formattedTransactionFeeICP } from "../../../../lib/utils/icp.utils";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    disburse: jest.fn().mockResolvedValue({ success: true }),
    getNeuronFromStore: jest.fn(),
  };
});

describe("ConfirmDisburseNeuron", () => {
  const amount = 6.66;
  const props = {
    amount: TokenAmount.fromNumber({ amount, token: ICPToken }),
    source: "test source",
    destinationAddress: "test destination",
    loading: false,
    fee: BigInt(3300000000),
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

    expect(getByText(props.source)).not.toBeNull();
    expect(getByText(props.destinationAddress)).not.toBeNull();
    expect(getByText(formattedTransactionFeeICP(props.fee))).not.toBeNull();
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
