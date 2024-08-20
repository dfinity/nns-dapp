import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  SnsSummaryMetadata,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "$lib/types/sns";
import { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import type { QuerySnsMetadata } from "$lib/types/sns.query";
import type { Universe } from "$lib/types/universe";
import {
  IcrcMetadataResponseEntries,
  type IcrcTokenMetadataResponse,
} from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import {
  SnsSwapLifecycle,
  type SnsGetDerivedStateResponse,
  type SnsGetLifecycleResponse,
  type SnsGetMetadataResponse,
  type SnsParams,
  type SnsSwap,
  type SnsSwapBuyerState,
  type SnsSwapDerivedState,
  type SnsSwapInit,
  type SnsTransferableAmount,
} from "@dfinity/sns";
import type { Token } from "@dfinity/utils";
import { nonNullish, toNullable } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";

export const mockProjectSubscribe =
  (projects: SnsFullProject[]) =>
  (run: Subscriber<SnsFullProject[]>): (() => void) => {
    run(projects);

    return () => undefined;
  };

// Opaque ids end with 0x01: https://internetcomputer.org/docs/current/references/ic-interface-spec/#principal
export const principal = (index: number): Principal => {
  let hexString = index.toString(16) + "01";
  if (hexString.length % 2 === 1) {
    hexString = "0" + hexString;
  }
  return Principal.fromHex(hexString);
};

export const createTransferableAmount = (
  amount: bigint
): SnsTransferableAmount => ({
  transfer_start_timestamp_seconds: 0n,
  amount_e8s: amount,
  transfer_success_timestamp_seconds: 0n,
  transfer_fee_paid_e8s: [],
  amount_transferred_e8s: [],
});
export const createBuyersState = (amount: bigint): SnsSwapBuyerState => ({
  icp: [createTransferableAmount(amount)],
  has_created_neuron_recipes: [],
});

export const mockSnsSwapCommitment = (
  rootCanisterId: Principal
): SnsSwapCommitment =>
  ({
    [principal(0).toText()]: {
      rootCanisterId: principal(0),
      myCommitment: createBuyersState(BigInt(25 * 100000000)),
    },
    [principal(1).toText()]: {
      rootCanisterId: principal(1),
      myCommitment: createBuyersState(BigInt(5 * 100000000)),
    },
    [principal(2).toText()]: {
      rootCanisterId: principal(2),
      myCommitment: undefined,
    },
    [principal(3).toText()]: {
      rootCanisterId: principal(3),
      myCommitment: undefined,
    },
  })[rootCanisterId.toText()];

const SECONDS_IN_DAY = 60 * 60 * 24;
const SECONDS_TODAY = +new Date(new Date().toJSON().split("T")[0]) / 1000;

export const mockSnsParams: SnsParams = {
  min_participant_icp_e8s: 150_000_000n,
  max_icp_e8s: BigInt(3000 * 100000000),
  neuron_basket_construction_parameters: [],
  swap_due_timestamp_seconds: BigInt(SECONDS_TODAY + SECONDS_IN_DAY * 5),
  min_participants: 1,
  sns_token_e8s: 150_000_000n,
  max_participant_icp_e8s: 5_000_000_000n,
  min_icp_e8s: BigInt(1500 * 100000000),
  sale_delay_seconds: [],
  min_direct_participation_icp_e8s: [],
  max_direct_participation_icp_e8s: [],
};

export const mockInit: SnsSwapInit = {
  nns_proposal_id: [123n],
  sns_root_canister_id:
    "vxi5c-ydsws-tmett-fndw6-7qwga-thtxc-epwtj-st3wy-jc464-muowb-eqe",
  min_participant_icp_e8s: [150_000_000n],
  neuron_basket_construction_parameters: [],
  fallback_controller_principal_ids: [],
  max_icp_e8s: [3_000_000_000n],
  neuron_minimum_stake_e8s: [100_000_000n],
  confirmation_text: [],
  swap_start_timestamp_seconds: [0n],
  swap_due_timestamp_seconds: [1n],
  min_participants: [1],
  sns_token_e8s: [150_000_000n],
  nns_governance_canister_id:
    "2vtpp-r6lcd-cbfas-qbabv-wxrv5-lsrkj-c4dtb-6ets3-srlqe-xpuzf-vqe",
  transaction_fee_e8s: [10_000n],
  icp_ledger_canister_id:
    "2lwez-knpss-xe26y-sqpx3-7m5ev-gbqwb-ogdk4-af53j-r7fed-k5df4-uqe",
  sns_ledger_canister_id:
    "nv24n-kslcc-636yn-hazy3-t2zgj-fsrkg-2uhfm-vumlm-vqolw-6ciai-tae",
  neurons_fund_participants: [],
  should_auto_finalize: [true],
  max_participant_icp_e8s: [5_000_000_000n],
  sns_governance_canister_id:
    "2vtpp-r6lcd-cbfas-qbabv-wxrv5-lsrkj-c4dtb-6ets3-srlqe-xpuzf-vqe",
  restricted_countries: [],
  min_icp_e8s: [1_500_000_000n],
  neurons_fund_participation_constraints: [],
  min_direct_participation_icp_e8s: [1_000_000_000n],
  max_direct_participation_icp_e8s: [3_000_000_000n],
  neurons_fund_participation: [],
};

export const mockSwap: SnsSummarySwap = {
  next_ticket_id: [],
  auto_finalize_swap_response: [],
  purge_old_tickets_last_completion_timestamp_nanoseconds: [],
  purge_old_tickets_next_principal: [],
  already_tried_to_auto_finalize: [false],
  neuron_recipes: [],
  cf_participants: [],
  init: [],
  decentralization_sale_open_timestamp_seconds: undefined,
  finalize_swap_in_progress: [],
  lifecycle: SnsSwapLifecycle.Open,
  open_sns_token_swap_proposal_id: [1_000n],
  buyers: [],
  params: mockSnsParams,
  direct_participation_icp_e8s: [],
  neurons_fund_participation_icp_e8s: [],
};

export const mockQuerySwap: SnsSwap = {
  auto_finalize_swap_response: [],
  neuron_recipes: [],
  cf_participants: [],
  decentralization_sale_open_timestamp_seconds: [],
  finalize_swap_in_progress: [],
  init: [],
  already_tried_to_auto_finalize: [],
  lifecycle: SnsSwapLifecycle.Open,
  open_sns_token_swap_proposal_id: [1_000n],
  buyers: [],
  params: [mockSnsParams],
  next_ticket_id: [],
  purge_old_tickets_last_completion_timestamp_nanoseconds: [],
  purge_old_tickets_next_principal: [],
  direct_participation_icp_e8s: [],
  neurons_fund_participation_icp_e8s: [],
  decentralization_swap_termination_timestamp_seconds: [],
};

export const mockDerived: SnsSwapDerivedState = {
  buyer_total_icp_e8s: BigInt(100 * 100000000),
  sns_tokens_per_icp: 1,
  cf_participant_count: [100n],
  direct_participant_count: [300n],
  cf_neuron_count: [200n],
  direct_participation_icp_e8s: [],
  neurons_fund_participation_icp_e8s: [],
};

export const mockDerivedResponse: SnsGetDerivedStateResponse = {
  buyer_total_icp_e8s: [BigInt(100 * 100000000)],
  sns_tokens_per_icp: [1],
  cf_participant_count: [100n],
  direct_participant_count: [300n],
  cf_neuron_count: [200n],
  direct_participation_icp_e8s: [],
  neurons_fund_participation_icp_e8s: [],
};

export const mockMetadata: SnsSummaryMetadata = {
  url: "http://sns-tetris-project.com",
  logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACzSURBVHgB7ZrBCcIwAEUTcYSMI6KC2H2cw30UQRwoO1Ry6DkptMhL3zvk9C7vEPiExMPxPIbO2Jcj51wVU0pN3hy3eN/Pu+qdLtcmb3J3oUOMomAUBaModBkVN78oXukZWrjlwUWxNEZRMIqCURRcFBT+vijWeB/xTlEwioJRFIyi4KKYsyha3OKNj7oX74OLwigKRlEwioKLgsJq/yhal8KS3uR6pygYRcEoCkZRcCZR+AGaGlXJPd3qegAAAABJRU5ErkJggg==",
  name: "Tetris",
  description:
    "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
};

export const mockToken: IcrcTokenMetadata = {
  name: "Tetris",
  symbol: "TET",
  fee: 0n,
  decimals: 8,
};

export const mockLifecycleResponse: SnsGetLifecycleResponse = {
  lifecycle: [SnsSwapLifecycle.Open],
  decentralization_sale_open_timestamp_seconds: [],
  decentralization_swap_termination_timestamp_seconds: [],
};

export const mockSnsSummaryList: SnsSummaryWrapper[] = [
  {
    rootCanisterId: principal(0),
    swapCanisterId: principal(3),
    governanceCanisterId: principal(2),
    ledgerCanisterId: principal(1),
    indexCanisterId: principal(4),
    metadata: mockMetadata,
    token: mockToken,
    swap: mockSwap,
    derived: mockDerived,
    init: mockInit,
    swapParams: mockSnsParams,
    lifecycle: mockLifecycleResponse,
  },
  {
    rootCanisterId: principal(1),
    swapCanisterId: principal(2),
    governanceCanisterId: principal(3),
    ledgerCanisterId: principal(0),
    indexCanisterId: principal(4),
    metadata: {
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAClSURBVHgB7dqxDYMwEEBRE2UET5I6icQUzMgc9EziHUAuqLElS+if/iuoruAXyCeL6fufjxTMuz5KKbeDOee0rXtq8Vs+TbM9cy3vWNX3fKWAjKIwisIoipBRU9iNYuTp3zM7eu6a9ZuiMIrCKAqjKNwoek711nuPkXPXrN8UhVEURlEYReFG4R3Fg4yiMIrCKAo3Cgr/o6AwisIoCqMojKIIuSadjJ5VyRrmqP4AAAAASUVORK5CYII=",
      name: "Pac-Man",
      url: "http://sns-pac-man-project.com",
      description:
        "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    },
    token: {
      name: "Pacman",
      symbol: "PAC",
      fee: 0n,
      decimals: 8,
    },
    swap: mockSwap,
    derived: mockDerived,
    init: mockInit,
    swapParams: mockSnsParams,
    lifecycle: mockLifecycleResponse,
  },
  {
    rootCanisterId: principal(2),
    swapCanisterId: principal(1),
    governanceCanisterId: principal(3),
    ledgerCanisterId: principal(0),
    indexCanisterId: principal(4),
    metadata: {
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACjSURBVHgB7dkxDkRAGEDh32ZPsuWWWy+JQ4gzimPolUpXIXMCM4nmjfcVqglegT+j+Xf9EZV5p8MyrZcL2/EX+7BFjs/8zVpbsi7nHpN0n6+okFEURlEYRVFlVPP4iaLkq37npFB6bZ8pCqMojKIwisKJomSP4s5zukcRvig4jKIwisKJgsK/HhRGURhFYRSFEwWFEwWFURRGURhFYRRFlWPSCah/Vck0pRWfAAAAAElFTkSuQmCC",
      name: "Super Mario",
      url: "http://sns-super-mario-project.com",
      description:
        "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    },
    token: {
      name: "Mario",
      symbol: "SPM",
      fee: 0n,
      decimals: 8,
    },
    swap: mockSwap,
    derived: mockDerived,
    init: mockInit,
    swapParams: mockSnsParams,
    lifecycle: mockLifecycleResponse,
  },
  {
    rootCanisterId: principal(3),
    swapCanisterId: principal(0),
    governanceCanisterId: principal(2),
    ledgerCanisterId: principal(1),
    indexCanisterId: principal(4),
    metadata: {
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC6SURBVHgB7ZkxCsJAFAUTETyAexcbEfZSHsJLBcTGu6wHsFK3SL0/EIvZzBSpHj87gYXHz3i+5M/QGfv6OB2mZvD5zqHcnC2lNHMppb+8ezd0iFIUlKKgFIUupcbNN4rpeB0i5Ndt1ZnRefNM7xQFpSgoRUEpCv02ijX3CZXoTmFJLnLGSj2nd4qCUhSUoqAUBXcUSxrF497O/j6ofz2iKEVBKQpKUbBRUHBHQUEpCkpRUIqCUhS6rElfBK1VyaWjTNYAAAAASUVORK5CYII=",
      name: "Donkey Kong",
      url: "http://sns-donkey-kong-project.com",
      description:
        "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    },
    token: {
      name: "Kong",
      symbol: "DKG",
      fee: 0n,
      decimals: 8,
    },
    swap: mockSwap,
    derived: mockDerived,
    init: mockInit,
    swapParams: mockSnsParams,
    lifecycle: mockLifecycleResponse,
  },
].map((summary) => new SnsSummaryWrapper(summary));

export const mockSummary = mockSnsSummaryList[0];

export const mockSwapCommitment = mockSnsSwapCommitment(
  principal(0)
) as SnsSwapCommitment;

export const mockSnsFullProject: SnsFullProject = {
  rootCanisterId: principal(0),
  summary: mockSummary,
  swapCommitment: mockSwapCommitment,
};

export const summaryForLifecycle = (
  lifecycle: SnsSwapLifecycle
): SnsSummaryWrapper => mockSnsFullProject.summary.overrideLifecycle(lifecycle);

type SnsSummaryParams = {
  lifecycle?: SnsSwapLifecycle;
  confirmationText?: string | undefined;
  restrictedCountries?: string[] | undefined;
  minParticipants?: number;
  buyersCount?: bigint | null;
  tokensDistributed?: bigint;
  minParticipantCommitment?: bigint;
  maxParticipantCommitment?: bigint;
  swapDueTimestampSeconds?: bigint;
  minTotalCommitment?: bigint;
  maxTotalCommitment?: bigint;
  currentTotalCommitment?: bigint;
  neuronsFundCommitment?: bigint;
  directCommitment?: bigint;
  minDirectParticipation?: bigint;
  maxDirectParticipation?: bigint;
  maxNFParticipation?: bigint;
  neuronsFundIsParticipating?: [boolean] | [];
  swapOpenTimestampSeconds?: bigint;
  nnsProposalId?: bigint;
  rootCanisterId?: Principal;
  projectName?: string;
  logo?: string;
};

export const createSummary = ({
  lifecycle = SnsSwapLifecycle.Open,
  confirmationText = undefined,
  restrictedCountries = undefined,
  minParticipants = 20,
  buyersCount = 300n,
  tokensDistributed = 2_000_000_000_000n,
  minParticipantCommitment = 100_000_000n,
  maxParticipantCommitment = 5_000_000_000n,
  swapDueTimestampSeconds = 1_630_444_800n,
  minTotalCommitment,
  maxTotalCommitment,
  currentTotalCommitment,
  neuronsFundCommitment,
  directCommitment,
  minDirectParticipation,
  maxDirectParticipation,
  maxNFParticipation,
  neuronsFundIsParticipating,
  swapOpenTimestampSeconds,
  nnsProposalId,
  rootCanisterId,
  projectName,
  logo,
}: SnsSummaryParams): SnsSummaryWrapper => {
  const init: SnsSwapInit = {
    ...mockInit,
    swap_due_timestamp_seconds: [swapDueTimestampSeconds],
    confirmation_text: toNullable(confirmationText),
    min_direct_participation_icp_e8s: toNullable(minDirectParticipation),
    max_direct_participation_icp_e8s: toNullable(maxDirectParticipation),
    neurons_fund_participation:
      neuronsFundIsParticipating ??
      // If `neuronsFundCommitment` is set, it means that the neurons fund is participating
      toNullable(nonNullish(neuronsFundCommitment)),
    restricted_countries: nonNullish(restrictedCountries)
      ? [{ iso_codes: restrictedCountries }]
      : [],
    neurons_fund_participation_constraints: nonNullish(maxNFParticipation)
      ? [
          {
            max_neurons_fund_participation_icp_e8s:
              toNullable(maxNFParticipation),
            coefficient_intervals: [],
            min_direct_participation_threshold_icp_e8s: [],
            ideal_matched_participation_function: [],
          },
        ]
      : [],
    nns_proposal_id: toNullable(nnsProposalId),
  };
  const params: SnsParams = {
    ...mockSnsParams,
    min_participants: minParticipants,
    sns_token_e8s: tokensDistributed,
    min_participant_icp_e8s: minParticipantCommitment,
    max_participant_icp_e8s: maxParticipantCommitment,
    swap_due_timestamp_seconds: swapDueTimestampSeconds,
    min_icp_e8s: minTotalCommitment ?? mockSnsParams.min_icp_e8s,
    max_icp_e8s: maxTotalCommitment ?? mockSnsParams.max_icp_e8s,
  };
  const derived: SnsSwapDerivedState = {
    ...mockDerived,
    direct_participant_count: buyersCount === null ? [] : [buyersCount],
    buyer_total_icp_e8s:
      currentTotalCommitment ?? mockDerived.buyer_total_icp_e8s,
    neurons_fund_participation_icp_e8s: toNullable(neuronsFundCommitment),
    direct_participation_icp_e8s: toNullable(directCommitment),
  };
  const metadata: SnsSummaryMetadata = {
    ...mockMetadata,
    name: projectName ?? mockMetadata.name,
    logo: logo ?? mockMetadata.logo,
  };
  const summary = summaryForLifecycle(lifecycle);
  return summary.override({
    rootCanisterId: rootCanisterId ?? summary.rootCanisterId,
    metadata,
    swap: {
      ...summary.swap,
      init: [init],
      params,
      decentralization_sale_open_timestamp_seconds: swapOpenTimestampSeconds,
    },
    derived,
    init,
  });
};

export const createMockSnsFullProject = ({
  summaryParams,
  rootCanisterId,
  icpCommitment,
}: {
  rootCanisterId: Principal;
  summaryParams: SnsSummaryParams;
  icpCommitment?: bigint;
}): SnsFullProject => ({
  rootCanisterId,
  summary: createSummary(summaryParams),
  swapCommitment: {
    rootCanisterId,
    myCommitment: nonNullish(icpCommitment)
      ? createBuyersState(icpCommitment)
      : undefined,
  },
});

export const mockQueryMetadataResponse: SnsGetMetadataResponse = {
  url: [`https://my.url/`],
  logo: ["a_logo"],
  name: [`My project`],
  description: ["Web3 for the win"],
};

export const mockSnsToken: IcrcTokenMetadata = {
  symbol: "TST",
  name: "Tetris",
  fee: 40_000n,
  decimals: 8,
};

export const mockQueryTokenResponse: IcrcTokenMetadataResponse = [
  [IcrcMetadataResponseEntries.DECIMALS, { Nat: 8n }],
  [IcrcMetadataResponseEntries.NAME, { Text: mockSnsToken.name }],
  [IcrcMetadataResponseEntries.SYMBOL, { Text: mockSnsToken.symbol }],
  [IcrcMetadataResponseEntries.FEE, { Nat: mockSnsToken.fee }],
  [IcrcMetadataResponseEntries.LOGO, { Text: mockSnsToken.logo }],
];

export const mockQueryMetadata: QuerySnsMetadata = {
  rootCanisterId: principal(0).toText(),
  certified: true,
  metadata: mockQueryMetadataResponse,
  token: mockQueryTokenResponse,
};

export const mockTokenStore = (run?: Subscriber<Token>) => {
  run?.(mockSnsToken);
  return () => undefined;
};

export const mockUniverse: Universe = {
  canisterId: principal(0).toText(),
  summary: mockSnsFullProject.summary,
  title: mockSnsFullProject.summary.metadata.name,
  logo: mockSnsFullProject.summary.metadata.logo,
};
