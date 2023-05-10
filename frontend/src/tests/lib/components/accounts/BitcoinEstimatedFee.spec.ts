import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinEstimatedFee from "$lib/components/accounts/BitcoinEstimatedFee.svelte";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { render, waitFor } from "@testing-library/svelte";

describe("BitcoinEstimatedFee", () => {
  let spyEstimateFee;

  const result = { minter_fee: 123n, bitcoin_fee: 456n };

  beforeEach(() => {
    spyEstimateFee = vi
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
      props: { selectedNetwork: TransactionNetwork.ICP, ...props },
    });

    const call = () => getByTestId("bitcoin-estimated-fee");
    expect(call).toThrow();

    expect(spyEstimateFee).not.toBeCalled();
  });

  it("should display estimated fee for network Bitcoin", async () => {
    const { getByTestId } = render(BitcoinEstimatedFee, {
      props: { selectedNetwork: TransactionNetwork.BTC_TESTNET, ...props },
    });

    await waitFor(() =>
      expect(getByTestId("bitcoin-estimated-fee")).not.toBeNull()
    );

    // Query + update
    expect(spyEstimateFee).toHaveBeenCalledTimes(2);

    const content =
      getByTestId("bitcoin-estimated-fee-label")?.textContent ?? "";

    expect(content).toEqual(en.accounts.estimated_bitcoin_transaction_fee);

    const fee = getByTestId("bitcoin-estimated-fee")?.textContent ?? "";

    expect(
      fee.includes(
        `${formatEstimatedFee(result.bitcoin_fee + result.minter_fee)}`
      )
    ).toBeTruthy();
    expect(fee.includes(en.ckbtc.btc)).toBeTruthy();
  });

  it("should call service with amount E8s", async () => {
    const amount = 456;

    render(BitcoinEstimatedFee, {
      props: {
        selectedNetwork: TransactionNetwork.BTC_TESTNET,
        amount,
        ...props,
      },
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
