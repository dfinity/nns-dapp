import { E8S_PER_ICP } from "../constants/icp.constants";

export const formatICP = (value: bigint): string =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  })
    .format(Number(value) / E8S_PER_ICP)
    .replace(",", ".");
