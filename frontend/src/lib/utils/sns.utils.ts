import { DEFAULT_SNS_LOGO } from "$lib/constants/sns.constants";
import type { SnsTicketsStore } from "$lib/stores/sns-tickets.store";
import type { PngDataUrl } from "$lib/types/assets";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "$lib/types/sns";
import type {
  QuerySns,
  QuerySnsMetadata,
  QuerySnsSwapState,
} from "$lib/types/sns.query";
import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import { AccountIdentifier, SubAccount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type {
  SnsGetMetadataResponse,
  SnsParams,
  SnsSwap,
  SnsSwapDerivedState,
} from "@dfinity/sns";
import { fromNullable, isNullish } from "@dfinity/utils";
import { isPngAsset } from "./utils";

type OptionalSnsSummarySwap = Omit<SnsSummarySwap, "params"> & {
  params?: SnsParams;
};

type OptionalSummary = QuerySns & {
  metadata?: SnsSummaryMetadata;
  token?: IcrcTokenMetadata;
  swap?: OptionalSnsSummarySwap;
  derived?: SnsSwapDerivedState;
  swapCanisterId?: Principal;
  governanceCanisterId?: Principal;
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
    nullishUrl === undefined ||
    nullishName === undefined ||
    nullishDescription === undefined
  ) {
    return undefined;
  }

  // We have to check if the logo is a png asset for security reasons.
  // Default logo can be svg.
  return {
    logo: isPngAsset(nullishLogo)
      ? nullishLogo
      : (DEFAULT_SNS_LOGO as PngDataUrl),
    url: nullishUrl,
    name: nullishName,
    description: nullishDescription,
  } as SnsSummaryMetadata;
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
        decentralization_sale_open_timestamp_seconds: fromNullable(
          swapData.decentralization_sale_open_timestamp_seconds
        ),
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
        governanceCanisterId: swapState?.governanceCanisterId,
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
      entry.governanceCanisterId !== undefined &&
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

export const hasOpenTicketInProcess = ({
  rootCanisterId,
  ticketsStore,
}: {
  rootCanisterId?: Principal | null;
  ticketsStore: SnsTicketsStore;
}): boolean => {
  if (isNullish(rootCanisterId)) {
    return true;
  }
  const projectTicketData = ticketsStore[rootCanisterId.toText()];

  if (isNullish(projectTicketData)) {
    return true;
  }

  return (
    projectTicketData.ticket !== null && projectTicketData.keepPolling === true
  );
};
