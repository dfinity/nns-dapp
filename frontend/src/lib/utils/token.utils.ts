import {
  E8S_PER_ICP,
  ICP_DISPLAYED_DECIMALS,
  ICP_DISPLAYED_DECIMALS_DETAILED,
  ICP_DISPLAYED_HEIGHT_DECIMALS,
} from "$lib/constants/icp.constants";
import {
  ICPToken,
  TokenAmount,
  TokenAmountV2,
  isNullish,
  type Token,
} from "@dfinity/utils";

const countDecimals = (value: number): number => {
  // "1e-7" -> 0.00000001
  const asText = value.toFixed(10).replace(/0*$/, "");
  const split: string[] = asText.split(".");

  return Math.max(split[1]?.length ?? 0, ICP_DISPLAYED_DECIMALS);
};

/**
 * Returns the number of tokens for a given amount of ulps.
 *
 * Precision up to 8 decimals to avoid problems with JS numbers.
 */
export const ulpsToNumber = ({
  ulps,
  decimals,
}: {
  ulps: bigint;
  decimals: number;
}): number => {
  const e8s = ulpsToE8s({ ulps, decimals });
  return Number(e8s) / 100_000_000;
};

/**
 * Truncates the given amount to 8 decimals.
 *
 * This is used to then convert the amount to a string or to a number afterwards.
 */
const ulpsToE8s = ({
  ulps,
  decimals,
}: {
  ulps: bigint;
  decimals: number;
}): bigint => {
  if (decimals === 8) {
    return ulps;
  } else if (decimals < 8) {
    return ulps * 10n ** BigInt(8 - decimals);
  }
  return ulps / 10n ** BigInt(decimals - 8);
};

// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
type RoundMode =
  | "ceil"
  | "floor"
  | "expand"
  | "trunc"
  | "halfCeil"
  | "halfFloor"
  | "halfExpand"
  | "halfTrunc"
  | "halfEven";

/**
 * Jira L2-666:
 * - If ICP is zero then 0 should be displayed - i.e. without decimals
 * - ICP with round number (12.0) should be displayed 12.00
 * - ICP should be displayed with max. 2 decimals (12.1 → 12.10, 12.12353 → 12.12, 12.00003 → 12.00) in Accounts, but with up to 8 decimals without tailing 0s in transaction details.
 * - However, if ICP value is lower than 0.01 then it should be as it is without tailing 0s up to 8 decimals (e.g., 0.000003 is displayed as 0.000003)
 *
 * Jira GIX-1563:
 * - However, if requested, some amount might be displayed with a fix length of 8 decimals, regardless if leading zero or no leading zero
 */
export const formatToken = ({
  value,
  detailed = false,
  roundingMode,
}: {
  value: bigint;
  detailed?: boolean | "height_decimals";
  roundingMode?: RoundMode;
}): string => {
  if (value === BigInt(0)) {
    return "0";
  }

  const converted = Number(value) / E8S_PER_ICP;

  const decimalsICP = (): number =>
    converted < 0.01
      ? Math.max(countDecimals(converted), ICP_DISPLAYED_DECIMALS)
      : detailed
      ? Math.min(countDecimals(converted), ICP_DISPLAYED_DECIMALS_DETAILED)
      : ICP_DISPLAYED_DECIMALS;

  const decimals =
    detailed === "height_decimals"
      ? ICP_DISPLAYED_HEIGHT_DECIMALS
      : decimalsICP();

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    // "roundingMode" not present in `NumberFormatOptions`.
    // But it's supported by most modern browsers: https://caniuse.com/mdn-javascript_builtins_intl_numberformat_numberformat_options_roundingmode_parameter
    // eslint-disable-next-line
    // @ts-ignore
    roundingMode,
  })
    .format(converted)
    .replace(/,/g, "'");
};

// TODO: This drops decimals after the 8th decimal place. Decide if this is the
// desired behavior.
export const formatTokenV2 = ({
  value,
  detailed = false,
  roundingMode,
}: {
  value?: TokenAmount | TokenAmountV2;
  detailed?: boolean | "height_decimals";
  roundingMode?: RoundMode;
}): string => {
  let e8s;
  if (isNullish(value)) {
    e8s = 0n;
  } else if (value instanceof TokenAmount) {
    e8s = value.toE8s();
  } else {
    const decimals = value.token.decimals;
    const ulps = value.toUlps();
    e8s = ulpsToE8s({ ulps, decimals });
  }
  return formatToken({ value: e8s, detailed, roundingMode });
};

export const sumAmountE8s = (...amountE8s: bigint[]): bigint =>
  amountE8s.reduce<bigint>((acc, amount) => acc + amount, BigInt(0));

// To make the fixed transaction fee readable, we do not display it with 8 digits but only till the last digit that is not zero
// e.g. not 0.00010000 but 0.0001
export const formattedTransactionFeeICP = (fee: number | bigint): string =>
  formatToken({
    value: TokenAmount.fromE8s({
      amount: BigInt(fee),
      token: ICPToken,
    }).toE8s(),
  });

// To make the fixed transaction fee readable, we do not display it with 8 digits but only till the last digit that is not zero
// e.g. not 0.00010000 but 0.0001
export const formattedTransactionFee = (fee: TokenAmount): string =>
  formatToken({
    value: TokenAmount.fromE8s({
      amount: fee.toE8s(),
      token: fee.token,
    }).toE8s(),
  });

/**
 * Calculates the maximum amount for a transaction.
 *
 * @param {Object} params
 * @param {bigint | undefined} params.balance The balance of the account in E8S.
 * @param {bigint | undefined} params.fee The fee of the transaction in E8S.
 * @param {bigint | undefined}params.maxAmount The maximum amount of the transaction not counting the fees.
 * @returns {number} The maximum amount for the transaction.
 */
export const getMaxTransactionAmount = ({
  balance = BigInt(0),
  fee = BigInt(0),
  maxAmount,
  token,
}: {
  balance?: bigint;
  fee?: bigint;
  maxAmount?: bigint;
  token: Token;
}): number => {
  const maxUserAmount = ulpsToE8s({
    ulps: balance - fee,
    decimals: token.decimals,
  });
  if (maxAmount === undefined) {
    return Math.max(Number(maxUserAmount), 0) / E8S_PER_ICP;
  }
  const maxAmountE8s = ulpsToE8s({ ulps: maxAmount, decimals: token.decimals });
  return (
    Math.min(Number(maxAmountE8s), Math.max(Number(maxUserAmount), 0)) /
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

/**
 * Returns the number of E8s for the given amount.
 *
 * E8s have a precision of 8 decimals. An error is thrown if the amount has more than 8 decimals.
 *
 * @param {number} amount
 * @returns {bigint}
 * @throws {Error} If the amount has more than 8 decimals.
 */
// TODO: GIX-2150 Make `token` mandatory.
export const numberToE8s = (amount: number, token: Token = ICPToken): bigint =>
  TokenAmount.fromNumber({
    amount,
    token,
  }).toE8s();

/**
 * Returns the number of Ulps for the given amount.
 *
 * The precision is given by the token.
 *
 * @param {Object} params
 * @param {number} parms.amount
 * @param {token} params.token
 * @returns {bigint}
 * @throws {Error} If the amount has more than number of decimals in the token.
 */
export const numberToUlps = (params: {
  amount: number;
  token: Token;
}): bigint => TokenAmountV2.fromNumber(params).toUlps();

export const toTokenAmountV2 = (tokenAmount: TokenAmount | TokenAmountV2) => {
  if (tokenAmount instanceof TokenAmountV2) {
    return tokenAmount;
  }
  return TokenAmountV2.fromUlps({
    amount: tokenAmount.toE8s(),
    token: tokenAmount.token,
  });
};

export class UnavailableTokenAmount {
  public token: Token;

  constructor(token: Token) {
    this.token = token;
  }
}
