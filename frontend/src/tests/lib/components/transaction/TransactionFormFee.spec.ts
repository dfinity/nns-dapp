import TransactionFormFee from "$lib/components/transaction/TransactionFormFee.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { TransactionFormFeePo } from "$tests/page-objects/TransactionFormFee.page-object";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionFormFee", () => {
  const renderComponent = (props: { transactionFee: TokenAmountV2 }) => {
    const { container } = render(TransactionFormFee, {
      props,
    });
    return TransactionFormFeePo.under(new JestPageObjectElement(container));
  };

  it("should display the transaction fee label", async () => {
    const transactionFee = TokenAmountV2.fromNumber({
      amount: 0.1,
      token: ICPToken,
    });
    const po = renderComponent({ transactionFee });

    expect(await po.getAmountDisplayPo().getText()).toBe("0.10 ICP");
  });

  it("should display the USD value without 'less than' sign when above or equal to $0.01", async () => {
    const icpPrice = 0.1;
    setIcpPrice(icpPrice);

    const transactionFee = TokenAmountV2.fromNumber({
      amount: 0.1,
      token: ICPToken,
    });
    const po = renderComponent({ transactionFee });

    // USD value is 0.1 * 0.1 = 0.01
    expect(await po.getUsdAmountDisplay()).toBe("($0.01)");
  });

  it("should display the USD value with 'less than' sign when below $0.01", async () => {
    const icpPrice = 0.09;
    setIcpPrice(icpPrice);

    const transactionFee = TokenAmountV2.fromNumber({
      amount: 0.1,
      token: ICPToken,
    });
    const po = renderComponent({ transactionFee });

    // USD value is 0.1 * 0.09 = 0.009, which is less than 0.01
    expect(await po.getUsdAmountDisplay()).toBe("(< $0.01)");
  });

  it("should display higher USD values correctly formatted", async () => {
    const icpPrice = 100;
    setIcpPrice(icpPrice);

    const transactionFee = TokenAmountV2.fromNumber({
      amount: 0.1,
      token: ICPToken,
    });
    const po = renderComponent({ transactionFee });

    // USD value is 0.1 * 100 = 10
    expect(await po.getUsdAmountDisplay()).toBe("($10.00)");
  });
});
