/**
 * @jest-environment jsdom
 */

import BitcoinEstimatedFeeDisplay from "$lib/components/accounts/BitcoinEstimatedFeeDisplay.svelte";
import { render } from "@testing-library/svelte";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import en from "../../../mocks/i18n.mock";

describe("BitcoinEstimatedFeeDisplay", () => {
  it("should display estimated fee", async () => {
    const fee = 45356n;

    const { getByTestId } = render(BitcoinEstimatedFeeDisplay, {
      props: { bitcoinEstimatedFee: fee },
    });

    const content =
      getByTestId("bitcoin-estimated-fee-display")?.textContent ?? "";

    expect(
      content.includes(en.accounts.estimated_bitcoin_transaction_fee)
    ).toBeTruthy();
    expect(content.includes(`${formatEstimatedFee(fee)}`)).toBeTruthy();
    expect(content.includes(en.ckbtc.btc)).toBeTruthy();
  });

  it("should not display estimated fee", () => {
    const { getByTestId } = render(BitcoinEstimatedFeeDisplay);

    const call = () => getByTestId("bitcoin-estimated-fee-display");
    expect(call).toThrow();
  });
});
