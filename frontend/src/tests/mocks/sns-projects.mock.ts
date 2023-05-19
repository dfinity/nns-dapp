import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "$lib/types/sns";
import type { QuerySnsMetadata } from "$lib/types/sns.query";
import {
  IcrcMetadataResponseEntries,
  type IcrcTokenMetadataResponse,
} from "@dfinity/ledger";
import type { Token } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsSwapLifecycle,
  type SnsGetMetadataResponse,
  type SnsParams,
  type SnsSwap,
  type SnsSwapBuyerState,
  type SnsSwapDerivedState,
  type SnsTransferableAmount,
} from "@dfinity/sns";
import type { Subscriber } from "svelte/store";

export const mockProjectSubscribe =
  (projects: SnsFullProject[]) =>
  (run: Subscriber<SnsFullProject[]>): (() => void) => {
    run(projects);

    return () => undefined;
  };

export const principal = (index: number): Principal =>
  [
    Principal.fromText(
      "2vtpp-r6lcd-cbfas-qbabv-wxrv5-lsrkj-c4dtb-6ets3-srlqe-xpuzf-vqe"
    ),
    Principal.fromText(
      "nv24n-kslcc-636yn-hazy3-t2zgj-fsrkg-2uhfm-vumlm-vqolw-6ciai-tae"
    ),
    Principal.fromText(
      "2lwez-knpss-xe26y-sqpx3-7m5ev-gbqwb-ogdk4-af53j-r7fed-k5df4-uqe"
    ),
    Principal.fromText(
      "vxi5c-ydsws-tmett-fndw6-7qwga-thtxc-epwtj-st3wy-jc464-muowb-eqe"
    ),
  ][index];

export const createTransferableAmount = (
  amount: bigint
): SnsTransferableAmount => ({
  transfer_start_timestamp_seconds: BigInt(0),
  amount_e8s: amount,
  transfer_success_timestamp_seconds: BigInt(0),
  transfer_fee_paid_e8s: [],
  amount_transferred_e8s: [],
});
export const createBuyersState = (amount: bigint): SnsSwapBuyerState => ({
  icp: [createTransferableAmount(amount)],
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
  }[rootCanisterId.toText()]);

const SECONDS_IN_DAY = 60 * 60 * 24;
const SECONDS_TODAY = +new Date(new Date().toJSON().split("T")[0]) / 1000;

export const mockSnsParams: SnsParams = {
  min_participant_icp_e8s: BigInt(150000000),
  max_icp_e8s: BigInt(3000 * 100000000),
  neuron_basket_construction_parameters: [],
  swap_due_timestamp_seconds: BigInt(SECONDS_TODAY + SECONDS_IN_DAY * 5),
  min_participants: 1,
  sns_token_e8s: BigInt(150000000),
  max_participant_icp_e8s: BigInt(5000000000),
  min_icp_e8s: BigInt(1500 * 100000000),
  sale_delay_seconds: [],
};

export const mockSwap: SnsSummarySwap = {
  neuron_recipes: [],
  cf_participants: [],
  init: [],
  decentralization_sale_open_timestamp_seconds: undefined,
  finalize_swap_in_progress: [],
  lifecycle: SnsSwapLifecycle.Open,
  open_sns_token_swap_proposal_id: [BigInt(1000)],
  buyers: [],
  params: mockSnsParams,
};

export const mockQuerySwap: SnsSwap = {
  neuron_recipes: [],
  cf_participants: [],
  decentralization_sale_open_timestamp_seconds: [],
  finalize_swap_in_progress: [],
  init: [],
  lifecycle: SnsSwapLifecycle.Open,
  open_sns_token_swap_proposal_id: [BigInt(1000)],
  buyers: [],
  params: [mockSnsParams],
  next_ticket_id: [],
  purge_old_tickets_last_completion_timestamp_nanoseconds: [],
  purge_old_tickets_next_principal: [],
};

export const mockDerived: SnsSwapDerivedState = {
  buyer_total_icp_e8s: BigInt(100 * 100000000),
  sns_tokens_per_icp: 1,
  cf_participant_count: [BigInt(100)],
  direct_participant_count: [BigInt(300)],
  cf_neuron_count: [BigInt(200)],
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
  fee: BigInt(0),
};

export const mockSnsSummaryList: SnsSummary[] = [
  {
    rootCanisterId: principal(0),
    swapCanisterId: principal(3),
    governanceCanisterId: principal(2),
    metadata: mockMetadata,
    token: mockToken,
    swap: mockSwap,
    derived: mockDerived,
  },
  {
    rootCanisterId: principal(1),
    swapCanisterId: principal(2),
    governanceCanisterId: principal(3),
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
      fee: BigInt(0),
    },
    swap: mockSwap,
    derived: mockDerived,
  },
  {
    rootCanisterId: principal(2),
    swapCanisterId: principal(1),
    governanceCanisterId: principal(3),
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
      fee: BigInt(0),
    },
    swap: mockSwap,
    derived: mockDerived,
  },
  {
    rootCanisterId: principal(3),
    swapCanisterId: principal(0),
    governanceCanisterId: principal(2),
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
      fee: BigInt(0),
    },
    swap: mockSwap,
    derived: mockDerived,
  },
];

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
): SnsSummary => ({
  ...mockSnsFullProject.summary,
  swap: {
    ...mockSwap,
    lifecycle,
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
  fee: BigInt(40_000),
};

export const mockQueryTokenResponse: IcrcTokenMetadataResponse = [
  [IcrcMetadataResponseEntries.DECIMALS, { Nat: BigInt(8) }],
  [IcrcMetadataResponseEntries.NAME, { Text: mockSnsToken.name }],
  [IcrcMetadataResponseEntries.SYMBOL, { Text: mockSnsToken.symbol }],
  [IcrcMetadataResponseEntries.FEE, { Nat: mockSnsToken.fee }],
];

export const mockQueryMetadata: QuerySnsMetadata = {
  rootCanisterId: principal(0).toText(),
  certified: true,
  metadata: mockQueryMetadataResponse,
  token: mockQueryTokenResponse,
};

export const mockTokenStore = (run: Subscriber<Token>) => {
  run(mockSnsToken);
  return () => undefined;
};
