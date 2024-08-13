import type { TokensStore, TokensStoreData } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { convertIcrc1Metadata } from "$lib/utils/sns-aggregator-converters.utils";
import {
  IcrcMetadataResponseEntries,
  type IcrcTokenMetadataResponse,
} from "@dfinity/ledger-icrc";
import { isNullish, nonNullish } from "@dfinity/utils";

/**
 * Token metadata is given only if the properties NNS-dapp needs (name, symbol and fee) are defined.
 */
export const mapOptionalToken = (
  response: IcrcTokenMetadataResponse
): IcrcTokenMetadata | undefined => {
  console.log('dskloetx response', response);
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
          break;
        case IcrcMetadataResponseEntries.DECIMALS:
          acc = {
            ...acc,
            ...("Nat" in value && { decimals: Number(value.Nat) }),
          };
          break;
        case IcrcMetadataResponseEntries.LOGO:
          acc = { ...acc, ...("Text" in value && { logo: value.Text }) };
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

  console.log('dskloetx nullishToken', nullishToken);
  return nullishToken as IcrcTokenMetadata;
};

export const fillTokensStoreFromAggregatorData = ({
  tokensStore,
  aggregatorData,
}: {
  tokensStore: TokensStore;
  aggregatorData: CachedSnsDto[];
}) => {
  tokensStore.setTokens(
    aggregatorData
      .map(({ icrc1_metadata, canister_ids }) => ({
        token: mapOptionalToken(convertIcrc1Metadata(icrc1_metadata)),
        // TODO: Remove root_canister_id and only used ledger_canister_id.
        root_canister_id: canister_ids.root_canister_id,
        ledger_canister_id: canister_ids.ledger_canister_id,
      }))
      .filter(({ token }) => nonNullish(token))
      .reduce(
        (acc, { root_canister_id, ledger_canister_id, token }) => ({
          ...acc,
          [root_canister_id]: {
            // Above filter ensure the token is not undefined therefore it can be safely cast
            token: token as IcrcTokenMetadata,
            certified: true,
          },
          [ledger_canister_id]: {
            // Above filter ensure the token is not undefined therefore it can be safely cast
            token: token as IcrcTokenMetadata,
            certified: true,
          },
        }),
        {} as TokensStoreData
      )
  );
};
