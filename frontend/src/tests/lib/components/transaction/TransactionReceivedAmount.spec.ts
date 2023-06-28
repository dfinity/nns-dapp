/**
 * @jest-environment jsdom
 */

import TransactionReceivedAmount from "$lib/components/transaction/TransactionReceivedAmount.svelte";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { ICPToken } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionReceivedAmount", () => {
  it("should render ICP amount", () => {
    const { getByTestId } = render(TransactionReceivedAmount, {
      props: { amount: 123.567, token: ICPToken },
    });

    expect(
      getByTestId("transaction-summary-total-received")?.textContent.trim()
    ).toEqual("123.56700000 ICP");
  });

  it("should render ckBTC amount", () => {
    const { getByTestId } = render(TransactionReceivedAmount, {
      props: { amount: 123.567, token: mockCkBTCToken },
    });

    expect(
      getByTestId("transaction-summary-total-received")?.textContent.trim()
    ).toEqual(`123.56700000 ${mockCkBTCToken.symbol}`);
  });
});
