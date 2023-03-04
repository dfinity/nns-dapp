/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinEstimatedFee from "$lib/components/accounts/BitcoinEstimatedFee.svelte";
import { TransactionNetwork } from "$lib/types/transaction";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import { render, waitFor } from "@testing-library/svelte";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { numberToE8s } from "$lib/utils/token.utils";
import { mockIdentity } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";

describe("BitcoinEstimatedFee", () => {
  let spyEstimateFee;

  const result = 123n;

  beforeEach(() => {
    spyEstimateFee = jest
      .spyOn(minterApi, "estimateFee")
      .mockResolvedValue(result);
  });

  const props = {
    minterCanisterId: CKBTC_MINTER_CANISTER_ID,
  };

  it("should not display estimated fee if no network selected", () => {
    const { getByTestId } = render(BitcoinEstimatedFee, {
      props: { selectedNetwork: undefined, ...props },
    });

    const call = () => getByTestId("bitcoin-estimated-fee");
    expect(call).toThrow();

    expect(spyEstimateFee).not.toBeCalled();
  });

  it("should not display estimated fee if network ckBTC", () => {
    const { getByTestId } = render(BitcoinEstimatedFee, {
      props: { selectedNetwork: TransactionNetwork.ICP_CKBTC, ...props },
    });

    const call = () => getByTestId("bitcoin-estimated-fee");
    expect(call).toThrow();

    expect(spyEstimateFee).not.toBeCalled();
  });

  it("should display estimated fee for network Bitcoin", async () => {
    const { getByTestId } = render(BitcoinEstimatedFee, {
      props: { selectedNetwork: TransactionNetwork.BITCOIN, ...props },
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

  it("should call service with amount E8s", async () => {
    const amount = 456;

    render(BitcoinEstimatedFee, {
      props: { selectedNetwork: TransactionNetwork.BITCOIN, amount, ...props },
    });

    await waitFor(() =>
      expect(spyEstimateFee).toHaveBeenCalledWith({
        amount: numberToE8s(amount),
        certified: false,
        identity: mockIdentity,
        canisterId: CKBTC_MINTER_CANISTER_ID,
      })
    );
  });
});
