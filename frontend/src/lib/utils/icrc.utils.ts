import type { TokenMetadata } from "$lib/types/token";
import { isNullish } from "$lib/utils/utils";
import {
  IcrcMetadataResponseEntries,
  type IcrcTokenMetadataResponse,
} from "@dfinity/ledger";

/**
 * Icrc token metadata is given only if the properties required by NNS-dapp - token name and symbol - are defined.
 *
 * Logo and other metadata are considered as optional by NNS-dapp - e.g. SNS-1 has no token logo.
 */
export const mapIcrcTokenMetadata = (
  response: IcrcTokenMetadataResponse
): TokenMetadata | undefined => {
  const nullishToken: Partial<TokenMetadata> = response.reduce(
    (acc, [key, value]) => {
      switch (key) {
        case IcrcMetadataResponseEntries.SYMBOL:
          acc = { ...acc, ...("Text" in value && { symbol: value.Text }) };
          break;
        // TODO: replace with ic-js constant https://github.com/dfinity/ic-js/pull/275
        case "icrc1:logo":
          acc = { ...acc, ...("Text" in value && { logo: value.Text }) };
          break;
        case IcrcMetadataResponseEntries.NAME:
          acc = { ...acc, ...("Text" in value && { name: value.Text }) };
      }

      return acc;
    },
    {}
  );

  if (isNullish(nullishToken.name) || isNullish(nullishToken.symbol)) {
    return undefined;
  }

  return nullishToken as TokenMetadata;
};
