import BitcoinFeeDisplay from "$lib/components/accounts/BitcoinFeeDisplay.svelte";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";
import BitcoinFeeDisplayTest from "./BitcoinFeeDisplayTest.svelte";

describe("BitcoinFeeDisplay", () => {
  const testId = "bitcoin-estimated-fee-display";

  it("should display estimated fee", async () => {
    const fee = 45356n;

    const { getByTestId } = render(BitcoinFeeDisplayTest, {
      props: { fee, testId },
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
    const { getByTestId } = render(BitcoinFeeDisplay, { props: { testId } });

    const call = () => getByTestId("bitcoin-estimated-fee-display");
    expect(call).toThrow();
  });
});
