import { ICPToken, TokenAmount } from "@dfinity/nns";
import {
  E8S_PER_ICP,
  ICP_DISPLAYED_DECIMALS,
  ICP_DISPLAYED_DECIMALS_DETAILED,
} from "../constants/icp.constants";

const countDecimals = (value: number): number => {
  // "1e-7" -> 0.00000001
  const asText = value.toFixed(10).replace(/0*$/, "");
  const split: string[] = asText.split(".");

  return Math.max(split[1]?.length ?? 0, ICP_DISPLAYED_DECIMALS);
};

/**
 * Jira L2-666:
 * - If ICP is zero then 0 should be displayed - i.e. without decimals
 * - ICP with round number (12.0) should be displayed 12.00
 * - ICP should be displayed with max. 2 decimals (12.1 → 12.10, 12.12353 → 12.12, 12.00003 → 12.00) in Accounts, but with up to 8 decimals without tailing 0s in transaction details.
 * - However, if ICP value is lower than 0.01 then it should be as it is without tailing 0s up to 8 decimals (e.g., 0.000003 is displayed as 0.000003)
 */
export const formatToken = ({
  value,
  detailed = false,
}: {
  value: bigint;
  detailed?: boolean;
}): string => {
  if (value === BigInt(0)) {
    return "0";
  }

  const converted: number = Number(value) / E8S_PER_ICP;
  const decimals: number =
    converted < 0.01
      ? Math.max(countDecimals(converted), ICP_DISPLAYED_DECIMALS)
      : detailed
      ? Math.min(countDecimals(converted), ICP_DISPLAYED_DECIMALS_DETAILED)
      : ICP_DISPLAYED_DECIMALS;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(converted)
    .replace(/,/g, "'");
};

export const sumTokenAmounts = (
  ...amountTokens: TokenAmount[]
): TokenAmount => {
  if (
    amountTokens.some(
      (amountToken) => amountToken.token.symbol !== amountTokens[0].token.symbol
    )
  ) {
    throw new Error("Token symbols must be equal");
  }
  return TokenAmount.fromE8s({
    amount: amountTokens.reduce<bigint>(
      (acc, icp) => acc + icp.toE8s(),
      BigInt(0)
    ),
    token: amountTokens[0].token,
  });
};

// To make the fixed transaction fee readable, we do not display it with 8 digits but only till the last digit that is not zero
// e.g. not 0.00010000 but 0.0001
export const formattedTransactionFeeICP = (fee: number): string =>
  formatToken({
    value: TokenAmount.fromE8s({
      amount: BigInt(fee),
      token: ICPToken,
    }).toE8s(),
  });

/**
 * Calculates the maximum amount for a transaction.
 *
 * @param balanceE8s The balance of the account in E8S.
 * @param fee The fee of the transaction in E8S.
 * @param maxAmount The maximum amount of the transaction not counting the fees.
 * @returns
 */
export const getMaxTransactionAmount = ({
  balance = BigInt(0),
  fee = BigInt(0),
  maxAmount,
}: {
  balance?: bigint;
  fee?: bigint;
  maxAmount?: bigint;
}): number => {
  if (maxAmount === undefined) {
    return Math.max(Number(balance - fee), 0) / E8S_PER_ICP;
  }
  return (
    Math.min(Number(maxAmount), Math.max(Number(balance - fee), 0)) /
    E8S_PER_ICP
  );
};

// `exchangeRate` is the number of 10,000ths of IMF SDR (currency code XDR) that corresponds to 1 ICP.
// This value reflects the current market price of one ICP token.
// https://github.com/dfinity/ic/blob/8132ae34aeba2bf8b913647b85b9918e1cb8721c/rs/nns/cmc/cmc.did#L67
const NUMBER_XDR_PER_ONE_ICP = 10_000;
export const convertIcpToTCycles = ({
  icpNumber,
  exchangeRate,
}: {
  icpNumber: number;
  exchangeRate: bigint;
}): number => icpNumber * (Number(exchangeRate) / NUMBER_XDR_PER_ONE_ICP);

export const convertTCyclesToIcpNumber = ({
  tCycles,
  exchangeRate,
}: {
  tCycles: number;
  exchangeRate: bigint;
}): number => tCycles / (Number(exchangeRate) / NUMBER_XDR_PER_ONE_ICP);
