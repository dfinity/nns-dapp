import type { IcrcTokenMetadata } from "$lib/types/icrc";
import {
  IcrcMetadataResponseEntries,
  type IcrcTokenMetadataResponse,
} from "@dfinity/ledger";
import { isNullish } from "@dfinity/utils";

/**
 * Token metadata is given only if the properties NNS-dapp needs (name, symbol and fee) are defined.
 */
export const mapOptionalToken = (
  response: IcrcTokenMetadataResponse
): IcrcTokenMetadata | undefined => {
  const nullishToken: Partial<IcrcTokenMetadata> = response.reduce(
    (acc, [key, value]) => {
      switch (key) {
        case IcrcMetadataResponseEntries.SYMBOL:
          acc = { ...acc, ...("Text" in value && { symbol: value.Text }) };
          break;
        case IcrcMetadataResponseEntries.NAME:
          acc = { ...acc, ...("Text" in value && { name: value.Text }) };
          break;
        case IcrcMetadataResponseEntries.FEE:
          acc = { ...acc, ...("Nat" in value && { fee: value.Nat }) };
      }

      return acc;
    },
    {}
  );

  if (
    isNullish(nullishToken.name) ||
    isNullish(nullishToken.symbol) ||
    isNullish(nullishToken.fee)
  ) {
    return undefined;
  }

  return nullishToken as IcrcTokenMetadata;
};
