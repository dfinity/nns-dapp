import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { MIN_VALID_SNS_GENERIC_NERVOUS_SYSTEM_FUNCTION_ID } from "$lib/constants/sns-proposals.constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import type { SnsTicketsStoreData } from "$lib/stores/sns-tickets.store";
import type { TicketStatus } from "$lib/types/sale";
import type { SnsSwapCommitment } from "$lib/types/sns";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp";
import type { Principal } from "@dfinity/principal";
import type {
  SnsGetAutoFinalizationStatusResponse,
  SnsGetDerivedStateResponse,
  SnsNervousSystemFunction,
  SnsProposalData,
} from "@dfinity/sns";
import type { DerivedState } from "@dfinity/sns/dist/candid/sns_swap";
import { fromNullable, isNullish, nonNullish } from "@dfinity/utils";

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
 * Returns `0n` if myCommitment is present but user has no commitment or amount is not present either.
 * Returns commitment e8s if commitment is defined.
 */
export const getCommitmentE8s = (
  swapCommitment: SnsSwapCommitment | null | undefined
): bigint | undefined => {
  if (isNullish(swapCommitment)) {
    return undefined;
  }
  return (
    fromNullable(swapCommitment?.myCommitment?.icp ?? [])?.amount_e8s ?? 0n
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

/**
 * An SNS is in finalization state if:
 *
 * 1. `has_auto_finalize_been_attempted` is true
 * 2. `auto_finalize_swap_response` is empty
 */
export const isSnsFinalizing = (
  finalizationStatus: SnsGetAutoFinalizationStatusResponse
): boolean => {
  const { has_auto_finalize_been_attempted, auto_finalize_swap_response } =
    finalizationStatus;

  return (
    Boolean(fromNullable(has_auto_finalize_been_attempted)) &&
    isNullish(fromNullable(auto_finalize_swap_response))
  );
};

export const convertDerivedStateResponseToDerivedState = (
  derivedState: SnsGetDerivedStateResponse
): DerivedState | undefined => {
  const sns_tokens_per_icp = fromNullable(derivedState.sns_tokens_per_icp);
  const buyer_total_icp_e8s = fromNullable(derivedState.buyer_total_icp_e8s);
  // This is not expected, but in case it happens, we want to fail fast.
  if (sns_tokens_per_icp === undefined || buyer_total_icp_e8s === undefined) {
    return;
  }
  return {
    ...derivedState,
    sns_tokens_per_icp,
    buyer_total_icp_e8s,
  };
};

/**
 * Returns true if the swap has ended more than one week ago.
 */
export const swapEndedMoreThanOneWeekAgo = ({
  summary,
  nowInSeconds,
}: {
  summary: SnsSummaryWrapper;
  nowInSeconds: number;
}) => {
  const oneWeekAgoInSeconds = BigInt(nowInSeconds - SECONDS_IN_DAY * 7);
  return oneWeekAgoInSeconds > summary.getSwapDueTimestampSeconds();
};

/**
 * Returns true if the FunctionType is NativeNervousSystemFunction.
 * Native means that the function can be executed only on its SNS canisters.
 * (same for all same-version snses)
 */
export const isSnsNativeNervousSystemFunction = ({
  id,
}: SnsNervousSystemFunction): boolean =>
  id < MIN_VALID_SNS_GENERIC_NERVOUS_SYSTEM_FUNCTION_ID;

/**
 * Returns true if the FunctionType is GenericNervousSystemFunction
 * Generic means that the function can be executed outside the SNS canisters (on any canister).
 * (custom per sns).
 */
export const isSnsGenericNervousSystemFunction = ({
  id,
}: SnsNervousSystemFunction): boolean =>
  id >= MIN_VALID_SNS_GENERIC_NERVOUS_SYSTEM_FUNCTION_ID;

/**
 * Returns true if the sns proposal is of the type GenericNervousSystemFunction
 */
export const isSnsGenericNervousSystemTypeProposal = ({
  action,
}: SnsProposalData): boolean =>
  action >= MIN_VALID_SNS_GENERIC_NERVOUS_SYSTEM_FUNCTION_ID;

/**
 * Returns true if the ledgerId is one of the SNS projects.
 */
export const isSnsLedgerCanisterId = ({
  ledgerCanisterId,
  snsProjects,
}: {
  ledgerCanisterId: Principal | undefined;
  snsProjects: SnsFullProject[] | undefined;
}): boolean =>
  nonNullish(ledgerCanisterId) &&
  nonNullish(snsProjects) &&
  snsProjects.some(
    ({ summary }) =>
      summary.ledgerCanisterId.toText() === ledgerCanisterId.toText()
  );
