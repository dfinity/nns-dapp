import { ICP } from "@dfinity/nns";
import { E8S_PER_ICP } from "../constants/icp.constants";

export const formatICP = (value: bigint): string =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  })
    .format(Number(value) / E8S_PER_ICP)
    .replace(",", ".");

export const sumICPs = (...icps: ICP[]): ICP =>
  ICP.fromE8s(icps.reduce<bigint>((acc, icp) => acc + icp.toE8s(), BigInt(0)));
