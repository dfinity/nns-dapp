import { DEFAULT_SNS_LOGO } from "$lib/constants/sns.constants";
import type { SnsTicketsStoreData } from "$lib/stores/sns-tickets.store";
import type { PngDataUrl } from "$lib/types/assets";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { TicketStatus } from "$lib/types/sale";
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
import { fromNullable, isNullish, nonNullish } from "@dfinity/utils";
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
  ledgerCanisterId?: Principal;
  indexCanisterId?: Principal;
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
        ledgerCanisterId: swapState?.ledgerCanisterId,
        indexCanisterId: swapState?.indexCanisterId,
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
      entry.ledgerCanisterId !== undefined &&
      entry.indexCanisterId !== undefined &&
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

/**
 * Returns `undefined` if swapCommitment is not present yet.
 * Returns `BigInt(0)` if myCommitment is present but user has no commitment or amount is not present either.
 * Returns commitment e8s if commitment is defined.
 */
export const getCommitmentE8s = (
  swapCommitment: SnsSwapCommitment | null | undefined
): bigint | undefined => {
  if (isNullish(swapCommitment)) {
    return undefined;
  }
  return (
    fromNullable(swapCommitment?.myCommitment?.icp ?? [])?.amount_e8s ??
    BigInt(0)
  );
};

/**
 * Tests the error message against `refresh_buyer_token` canister function.
 * This is the workaround before the api call provides nice error details.
 *
 * @param err
 */
export const isInternalRefreshBuyerTokensError = (err: unknown): boolean => {
  if (!(err instanceof Error)) {
    return false;
  }

  const { message } = err;
  return [
    // https://github.com/dfinity/ic/blob/c3f45aef7c2aa734c0451eaed682036879e54775/rs/sns/swap/src/swap.rs
    "The token amount can only be refreshed when the canister is in the OPEN state",
    // https://github.com/dfinity/ic/blob/c3f45aef7c2aa734c0451eaed682036879e54775/rs/sns/swap/src/swap.rs#L611
    "The ICP target for this token swap has already been reached.",
    // https://github.com/dfinity/ic/blob/c3f45aef7c2aa734c0451eaed682036879e54775/rs/sns/swap/src/swap.rs#L649
    "The swap has already reached its target",
    // https://github.com/dfinity/ic/blob/c3f45aef7c2aa734c0451eaed682036879e54775/rs/sns/swap/src/swap.rs#L658
    "Amount transferred:",
    // https://github.com/dfinity/ic/blob/c3f45aef7c2aa734c0451eaed682036879e54775/rs/sns/swap/src/swap.rs#L697
    "New balance:",
    // https://github.com/dfinity/ic/blob/c3f45aef7c2aa734c0451eaed682036879e54775/rs/sns/swap/src/swap.rs#L718
    "The available balance to be topped up",
  ].some((text) => message.includes(text));
};

export const hasOpenTicketInProcess = ({
  rootCanisterId,
  ticketsStore,
}: {
  rootCanisterId?: Principal | null;
  ticketsStore: SnsTicketsStoreData;
}): { status: TicketStatus } => {
  if (isNullish(rootCanisterId)) {
    return { status: "unknown" };
  }
  const projectTicketData = ticketsStore[rootCanisterId.toText()];

  if (isNullish(projectTicketData)) {
    return { status: "unknown" };
  }

  // If we have a ticket, we have an open ticket in process.
  if (nonNullish(projectTicketData.ticket)) {
    return { status: "open" };
  }

  // `null` means that the user has no open tickets.
  if (projectTicketData.ticket === null) {
    return { status: "none" };
  }

  // As long as we don't have a known state, we assume we're fetching the data.
  return { status: "loading" };
};

/**
 * Parse the `sale_buyer_count` value from metrics text.
 *
 * @example text
 * ...
 * # TYPE sale_buyer_count gauge
 * sale_buyer_count 33 1677707139456
 * # HELP sale_cf_participants_count
 * ...
 */
export const parseSnsSwapSaleBuyerCount = (
  text: string
): number | undefined => {
  const value = Number(
    text
      .split("\n")
      ?.find((line) => line.startsWith("sale_buyer_count "))
      ?.split(/\s/)?.[1]
  );
  return isNaN(value) ? undefined : value;
};
