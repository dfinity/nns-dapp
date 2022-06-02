import { ICP } from "@dfinity/nns";
import {
  E8S_PER_ICP,
  ICP_DISPLAYED_DECIMALS,
  ICP_DISPLAYED_DECIMALS_DETAILED,
  ONE_TRILLION,
  TRANSACTION_FEE_E8S,
} from "../constants/icp.constants";
import { InvalidAmountError } from "../types/neurons.errors";

const countDecimals = (value: number): number => {
  const split: string[] = `${value}`.split(".");
  return Math.max(split[1]?.length ?? 0, ICP_DISPLAYED_DECIMALS);
};

/**
 * Jira L2-666:
 * - If ICP is zero then 0 should be displayed - i.e. without decimals
 * - ICP with round number (12.0) should be displayed 12.00
 * - ICP should be displayed with max. 2 decimals (12.1 → 12.10, 12.12353 → 12.12, 12.00003 → 12.00) in Accounts, but with up to 8 decimals without tailing 0s in transaction details.
 * - However, if ICP value is lower than 0.01 then it should be as it is without tailing 0s up to 8 decimals (e.g., 0.000003 is displayed as 0.000003)
 */
export const formatICP = ({
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

  console.log(converted, countDecimals(converted));

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(Number(value) / E8S_PER_ICP)
    .replace(",", ".");
};

export const sumICPs = (...icps: ICP[]): ICP =>
  ICP.fromE8s(icps.reduce<bigint>((acc, icp) => acc + icp.toE8s(), BigInt(0)));

// To make the fixed transaction fee readable, we do not display it with 8 digits but only till the last digit that is not zero
// e.g. not 0.00010000 but 0.0001
export const formattedTransactionFeeICP = (): string =>
  formatICP({
    value: ICP.fromE8s(BigInt(TRANSACTION_FEE_E8S)).toE8s(),
  });

export const maxICP = (icp: ICP | undefined): number =>
  Math.max((Number(icp?.toE8s() ?? 0) - TRANSACTION_FEE_E8S) / E8S_PER_ICP, 0);

export const isValidICPFormat = (text: string) =>
  /^[\d]*(\.[\d]{0,8})?$/.test(text);

const ICP_DECIMAL_ACCURACY = 8;
export const convertNumberToICP = (amount: number): ICP => {
  const stake = ICP.fromString(amount.toFixed(ICP_DECIMAL_ACCURACY));

  if (!(stake instanceof ICP) || stake === undefined) {
    throw new InvalidAmountError();
  }

  return stake;
};

export const convertIcpToTCycles = ({
  icpNumber,
  ratio,
}: {
  icpNumber: number;
  ratio: bigint;
}): number => {
  const icp = convertNumberToICP(icpNumber);
  return Number(icp.toE8s() * ratio) / ONE_TRILLION;
};

export const convertTCyclesToIcpNumber = ({
  tCycles,
  ratio,
}: {
  tCycles: number;
  ratio: bigint;
}): number => (tCycles * Number(ONE_TRILLION)) / Number(ratio) / E8S_PER_ICP;
