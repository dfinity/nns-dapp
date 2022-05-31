import { ICP } from "@dfinity/nns";
import {
  E8S_PER_ICP,
  ONE_TRILLION,
  TRANSACTION_FEE_E8S,
} from "../constants/icp.constants";
import { InvalidAmountError } from "../types/neurons.errors";

export const formatICP = (value: bigint): string =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  })
    .format(Number(value) / E8S_PER_ICP)
    .replace(",", ".");

export const sumICPs = (...icps: ICP[]): ICP =>
  ICP.fromE8s(icps.reduce<bigint>((acc, icp) => acc + icp.toE8s(), BigInt(0)));

export const formattedTransactionFeeICP = () =>
  formatICP(ICP.fromE8s(BigInt(TRANSACTION_FEE_E8S)).toE8s());

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

export const convertTCyclesToE8s = ({
  tCycles,
  ratio,
}: {
  tCycles: number;
  ratio: bigint;
}): bigint => BigInt(tCycles * ONE_TRILLION) / ratio;
