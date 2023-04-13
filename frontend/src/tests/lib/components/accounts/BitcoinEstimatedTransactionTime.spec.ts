/**
 * @jest-environment jsdom
 */

import BitcoinEstimatedTransactionTime from "$lib/components/accounts/BitcoinEstimatedTransactionTime.svelte";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("BitcoinEstimatedTransactionTime", () => {
  it("should display estimated static transaction time", () => {
    const { container } = render(BitcoinEstimatedTransactionTime, {
      props: { networkBtc: true },
    });

    expect(container.textContent).toEqual(
      `${en.accounts.transaction_time} ${en.ckbtc.about_thirty_minutes}`
    );
  });

  it("should not render estimated static transaction time", () => {
    const { container } = render(BitcoinEstimatedTransactionTime, {
      props: { networkBtc: false },
    });

    expect(container.querySelectorAll("p").length).toEqual(0);
  });
});
