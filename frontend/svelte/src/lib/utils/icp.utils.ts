import { ICP } from "@dfinity/nns";
import { E8S_PER_ICP, TRANSACTION_FEE_E8S } from "../constants/icp.constants";

const formatNumberToString = ({
  value,
  fractionDigits = 8,
}: {
  value: bigint;
  fractionDigits?: number;
}): string =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
    .format(Number(value) / E8S_PER_ICP)
    .replace(",", ".");

export const formatICP = (value: bigint): string =>
  formatNumberToString({ value });

export const sumICPs = (...icps: ICP[]): ICP =>
  ICP.fromE8s(icps.reduce<bigint>((acc, icp) => acc + icp.toE8s(), BigInt(0)));

// To make the fixed transaction fee readable, we do not display it with 8 digits but only till the last digit that is not zero
// e.g. not 0.00010000 but 0.0001
export const formattedTransactionFeeICP = (): string =>
  formatNumberToString({
    value: ICP.fromE8s(BigInt(TRANSACTION_FEE_E8S)).toE8s(),
    fractionDigits: 4,
  });

export const maxICP = (icp: ICP | undefined): number =>
  Math.max((Number(icp?.toE8s() ?? 0) - TRANSACTION_FEE_E8S) / E8S_PER_ICP, 0);

export const isValidICPFormat = (text: string) =>
  /^[\d]*(\.[\d]{0,8})?$/.test(text);
