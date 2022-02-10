import { E8S_PER_ICP } from "../constants/icp.constants";

export const formatICP = (
  value: bigint,
  { min, max }: { min?: number; max?: number } = { min: 8, max: 8 }
): string =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
    .format(Number(value) / E8S_PER_ICP)
    .replace(",", ".");
