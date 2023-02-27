/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinEstimatedFee from "$lib/components/accounts/BitcoinEstimatedFee.svelte";
import { render, waitFor } from "@testing-library/svelte";
import { TransactionNetwork } from "$lib/types/transaction";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import en from "../../../mocks/i18n.mock";

describe("BitcoinEstimatedFee", () => {
  let spyEstimateFee;

  const result = 123n;

  beforeEach(() => {
    spyEstimateFee = jest
      .spyOn(minterApi, "estimateFee")
      .mockResolvedValue(result);
  });

  it("should not display estimated fee if no network selected", () => {
    const { getByTestId } = render(BitcoinEstimatedFee, {
      props: { selectedNetwork: undefined },
    });

    const call = () => getByTestId("bitcoin-estimated-fee");
    expect(call).toThrow();

    expect(spyEstimateFee).not.toBeCalled();
  });

  it("should not display estimated fee if network ckBTC", () => {
    const { getByTestId } = render(BitcoinEstimatedFee, {
      props: { selectedNetwork: TransactionNetwork.ICP_CKBTC },
    });

    const call = () => getByTestId("bitcoin-estimated-fee");
    expect(call).toThrow();

    expect(spyEstimateFee).not.toBeCalled();
  });

  it("should display estimated fee for network Bitcoin", async () => {
    const { getByTestId } = render(BitcoinEstimatedFee, {
      props: { selectedNetwork: TransactionNetwork.BITCOIN },
    });

    await waitFor(() =>
      expect(getByTestId("bitcoin-estimated-fee")).not.toBeNull()
    );

    // Query + update
    expect(spyEstimateFee).toHaveBeenCalledTimes(2);

    const content = getByTestId("bitcoin-estimated-fee")?.textContent ?? "";

    expect(
      content.includes(en.accounts.estimated_bitcoin_transaction_fee)
    ).toBeTruthy();
    expect(content.includes(`${formatEstimatedFee(result)}`)).toBeTruthy();
    expect(content.includes(en.ckbtc.btc)).toBeTruthy();
  });
});
