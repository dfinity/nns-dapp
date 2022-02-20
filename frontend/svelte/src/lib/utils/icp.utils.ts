import { E8S_PER_ICP } from "../constants/icp.constants";

export const formatICP = ({
  value,
  minFraction = 8,
  maxFraction = 8,
}: {
  value: bigint;
  minFraction?: number;
  maxFraction?: number;
}): string =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  })
    .format(Number(value) / E8S_PER_ICP)
    .replace(",", ".");
