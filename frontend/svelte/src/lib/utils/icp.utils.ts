import { ICP } from "@dfinity/nns";
import { E8S_PER_ICP, TRANSACTION_FEE_E8S } from "../constants/icp.constants";

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
