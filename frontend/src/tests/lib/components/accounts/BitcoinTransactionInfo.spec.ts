/**
 * @jest-environment jsdom
 */

import BitcoinEstimatedTransactionTime from "$lib/components/accounts/BitcoinTransactionInfo.svelte";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("BitcoinTransactionInfo", () => {
  it("should display estimated static transaction time", () => {
    const { getByText } = render(BitcoinEstimatedTransactionTime, {
      props: { networkBtc: true },
    });

    expect(getByText(en.accounts.transaction_time)).toBeInTheDocument();
    expect(getByText(en.ckbtc.about_thirty_minutes)).toBeInTheDocument();
  });

  it("should display confirmations", () => {
    const { getByText } = render(BitcoinEstimatedTransactionTime, {
      props: { networkBtc: true },
    });

    expect(getByText(en.ckbtc.confirmations)).toBeInTheDocument();
    expect(getByText(en.ckbtc.typically_twelve)).toBeInTheDocument();
  });

  it("should not render information", () => {
    const { container } = render(BitcoinEstimatedTransactionTime, {
      props: { networkBtc: false },
    });

    expect(container.querySelectorAll("p").length).toEqual(0);
  });
});
