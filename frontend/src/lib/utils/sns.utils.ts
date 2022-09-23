import { AccountIdentifier, SubAccount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { SnsParams } from "@dfinity/sns";
import {
  SnsMetadataResponseEntries,
  type SnsGetMetadataResponse,
  type SnsSwap,
  type SnsSwapDerivedState,
  type SnsTokenMetadataResponse,
} from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsSummarySwap,
  SnsSwapCommitment,
  SnsTokenMetadata,
} from "../types/sns";
import type {
  QuerySns,
  QuerySnsMetadata,
  QuerySnsSwapState,
} from "../types/sns.query";

type OptionalSnsSummarySwap = Omit<SnsSummarySwap, "params"> & {
  params?: SnsParams;
};

type OptionalSummary = QuerySns & {
  metadata?: SnsSummaryMetadata;
  token?: SnsTokenMetadata;
  swap?: OptionalSnsSummarySwap;
  derived?: SnsSwapDerivedState;
  swapCanisterId?: Principal;
};

type ValidSummary = Required<Omit<OptionalSummary, "swap">> & {
  swap: SnsSummarySwap;
};

/**
 * Sort Sns summaries according their swap end dates. Sooner end dates first.
 * @param summaries
 */
const sortSnsSummaries = (summaries: SnsSummary[]): SnsSummary[] =>
  summaries.sort(
    (
      {
        swap: {
          params: { swap_due_timestamp_seconds: endTimeWindowA },
        },
      }: SnsSummary,
      {
        swap: {
          params: { swap_due_timestamp_seconds: endTimeWindowB },
        },
      }: SnsSummary
    ) => (endTimeWindowA < endTimeWindowB ? -1 : 1)
  );

/**
 * Metadata is given only if all its properties are defined.
 */
const mapOptionalMetadata = ({
  logo,
  url,
  name,
  description,
}: SnsGetMetadataResponse): SnsSummaryMetadata | undefined => {
  const nullishLogo = fromNullable(logo);
  const nullishUrl = fromNullable(url);
  const nullishName = fromNullable(name);
  const nullishDescription = fromNullable(description);

  if (
    nullishLogo === undefined ||
    nullishUrl === undefined ||
    nullishName === undefined ||
    nullishDescription === undefined
  ) {
    return undefined;
  }

  return {
    logo: nullishLogo,
    url: nullishUrl,
    name: nullishName,
    description: nullishDescription,
  } as SnsSummaryMetadata;
};

/**
 * Token metadata is given only if the properties NNS-dapp needs (name and symbol) are defined.
 */
export const mapOptionalToken = (
  response: SnsTokenMetadataResponse
): SnsTokenMetadata | undefined => {
  const nullishToken: Partial<SnsTokenMetadata> = response.reduce(
    (acc, [key, value]) => {
      switch (key) {
        case SnsMetadataResponseEntries.SYMBOL:
          acc = { ...acc, ...("Text" in value && { symbol: value.Text }) };
          break;
        case SnsMetadataResponseEntries.NAME:
          acc = { ...acc, ...("Text" in value && { name: value.Text }) };
      }

      return acc;
    },
    {}
  );

  if (nullishToken.name === undefined || nullishToken.symbol === undefined) {
    return undefined;
  }

  return nullishToken as SnsTokenMetadata;
};

/**
 * Maps the properties of the SnsSwap type to the properties of the SnsSummarySwap type.
 * For now, the only property is extracted from candid optional type is `params`.
 */
const mapOptionalSwap = (
  swapData: SnsSwap | undefined
): OptionalSnsSummarySwap | undefined =>
  swapData === undefined
    ? undefined
    : {
        ...swapData,
        params: fromNullable(swapData.params),
      };

/**
 * 1. Concat Sns queries for metadata and swap state.
 * 2. Filter those Sns without metadata, swap and derived information
 * 3. Sort according swap start date
 *
 * Note from NNS team about mandatory swap and derived data that are defined as optional in Candid:
 *
 * Swap state and Derived State should always be populated.
 * They are optional as that is the best strategy for backwards compatibility from the protobuf side, which is what we derive our candid APIs from.
 * If either of those are missing, that would indicate a bigger issue with the swap canister and can be safely ignored from the nns-dapp.
 *
 * Note about mandatory Metadata:
 *
 * Having mandatory metadata values is the cleanest solution from code perspective but also from feature perspective, user need information to invest in sales they trust.
 * This might evolve in the future but at least for a first version it is the best approach for above reasons.
 *
 */
export const mapAndSortSnsQueryToSummaries = ({
  metadata,
  swaps,
}: {
  metadata: QuerySnsMetadata[];
  swaps: QuerySnsSwapState[];
}): SnsSummary[] => {
  const allSummaries: OptionalSummary[] = metadata.map(
    ({ rootCanisterId, metadata, token, ...rest }: QuerySnsMetadata) => {
      const swapState = swaps.find(
        ({ rootCanisterId: swapRootCanisterId }: QuerySnsSwapState) =>
          swapRootCanisterId === rootCanisterId
      );

      const swapData = fromNullable(swapState?.swap ?? []);
      return {
        ...rest,
        rootCanisterId,
        metadata: mapOptionalMetadata(metadata),
        token: mapOptionalToken(token),
        swapCanisterId: swapState?.swapCanisterId,
        swap: mapOptionalSwap(swapData),
        derived: fromNullable(swapState?.derived ?? []),
      };
    }
  );

  // Only those that have valid metadata, toke, sale and derived information are - and can be - considered as valid
  const validSwapSummaries: ValidSummary[] = allSummaries.filter(
    (entry: OptionalSummary): entry is ValidSummary =>
      entry.swap !== undefined &&
      entry.swap.params !== undefined &&
      entry.swapCanisterId !== undefined &&
      entry.derived !== undefined &&
      entry.metadata !== undefined &&
      entry.token !== undefined
  );

  return sortSnsSummaries(
    validSwapSummaries.map(({ rootCanisterId, ...rest }) => ({
      rootCanisterId: Principal.fromText(rootCanisterId),
      ...rest,
    }))
  );
};

export const getSwapCanisterAccount = ({
  controller,
  swapCanisterId,
}: {
  controller: Principal;
  swapCanisterId: Principal;
}): AccountIdentifier => {
  const principalSubaccount = SubAccount.fromPrincipal(controller);
  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal: swapCanisterId,
    subAccount: principalSubaccount,
  });

  return accountIdentifier;
};

export const getCommitmentE8s = (
  swapCommitment?: SnsSwapCommitment | null
): bigint | undefined =>
  fromNullable(swapCommitment?.myCommitment?.icp ?? [])?.amount_e8s ??
  undefined;
