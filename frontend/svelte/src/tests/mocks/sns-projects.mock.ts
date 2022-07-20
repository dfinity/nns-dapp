import { Principal } from "@dfinity/principal";
import type { SnsSwapLifecycle, SnsSwapState } from "@dfinity/sns";
import type { SnsFullProject } from "../../lib/stores/projects.store";
import type { SnsSummary, SnsSwapCommitment } from "../../lib/types/sns";
import { shuffle } from "../../lib/utils/dev.utils";

const principal = (index: number): Principal =>
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

export const mockSnsSwapCommitment = (
  rootCanisterId: Principal
): SnsSwapCommitment =>
  ({
    [principal(0).toText()]: {
      rootCanisterId: principal(0),
      myCommitment: BigInt(25 * 100000000),
      currentCommitment: BigInt(100 * 100000000),
    },
    [principal(1).toText()]: {
      rootCanisterId: principal(1),
      myCommitment: BigInt(5 * 100000000),
      currentCommitment: BigInt(775 * 100000000),
    },
    [principal(2).toText()]: {
      rootCanisterId: principal(2),
      myCommitment: undefined,
      currentCommitment: BigInt(1000 * 100000000),
    },
    [principal(3).toText()]: {
      rootCanisterId: principal(3),
      myCommitment: undefined,
      currentCommitment: BigInt(1500 * 100000000),
    },
  }[rootCanisterId.toText()]);

const SECONDS_IN_DAY = 60 * 60 * 24;
const SECONDS_TODAY = +new Date(new Date().toJSON().split("T")[0]) / 1000;

export const mockSwapInit = {
  min_participant_icp_e8s: BigInt(150000000),
  fallback_controller_principal_ids: [],
  max_icp_e8s: BigInt(3000 * 100000000),
  min_participants: 1,
  nns_governance_canister_id: "1234",
  icp_ledger_canister_id: "1234",
  sns_ledger_canister_id: "1234",
  max_participant_icp_e8s: BigInt(5000000000),
  sns_governance_canister_id: "1234",
  min_icp_e8s: BigInt(1500 * 100000000),
};

export const mockSwapState = {
  open_time_window: [],
  sns_token_e8s: BigInt(1000),
  lifecycle: 0,
  buyers: [],
} as SnsSwapState;

export const mockSwap = {
  init: mockSwapInit,
  state: mockSwapState,
};

export const mockSnsSummaryList: SnsSummary[] = shuffle([
  {
    rootCanisterId: principal(0),

    swapDeadline: BigInt(Math.round(Date.now() / 1000) + SECONDS_IN_DAY / 4),
    swapStart: BigInt(Math.round(Date.now() / 1000) - SECONDS_IN_DAY / 4),
    minCommitment: BigInt(1500 * 100000000),
    maxCommitment: BigInt(3000 * 100000000),
    minParticipationCommitment: BigInt(150000000),
    maxParticipationCommitment: BigInt(5000000000),
    tokenName: "Tetris",

    logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACzSURBVHgB7ZrBCcIwAEUTcYSMI6KC2H2cw30UQRwoO1Ry6DkptMhL3zvk9C7vEPiExMPxPIbO2Jcj51wVU0pN3hy3eN/Pu+qdLtcmb3J3oUOMomAUBaModBkVN78oXukZWrjlwUWxNEZRMIqCURRcFBT+vijWeB/xTlEwioJRFIyi4KKYsyha3OKNj7oX74OLwigKRlEwioKLgsJq/yhal8KS3uR6pygYRcEoCkZRcCZR+AGaGlXJPd3qegAAAABJRU5ErkJggg==",
    name: "Tetris",
    symbol: "TET",
    url: "http://sns-tetris-project.com",
    description:
      "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    swap: mockSwap,
  },
  {
    rootCanisterId: principal(1),

    swapDeadline: BigInt(SECONDS_TODAY + SECONDS_IN_DAY * 30),
    swapStart: BigInt(SECONDS_TODAY - SECONDS_IN_DAY * 20),
    minCommitment: BigInt(1000 * 100000000),
    maxCommitment: BigInt(2000 * 100000000),
    minParticipationCommitment: BigInt(100000000),
    maxParticipationCommitment: BigInt(3000000000),
    tokenName: "Pacman",

    logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAClSURBVHgB7dqxDYMwEEBRE2UET5I6icQUzMgc9EziHUAuqLElS+if/iuoruAXyCeL6fufjxTMuz5KKbeDOee0rXtq8Vs+TbM9cy3vWNX3fKWAjKIwisIoipBRU9iNYuTp3zM7eu6a9ZuiMIrCKAqjKNwoek711nuPkXPXrN8UhVEURlEYReFG4R3Fg4yiMIrCKAo3Cgr/o6AwisIoCqMojKIIuSadjJ5VyRrmqP4AAAAASUVORK5CYII=",
    name: "Pac-Man",
    symbol: "PAC",
    url: "http://sns-pac-man-project.com",
    description:
      "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    swap: mockSwap,
  },
  {
    rootCanisterId: principal(2),

    // what needs to be shown for upcomming projects
    swapDeadline: BigInt(
      SECONDS_TODAY + SECONDS_IN_DAY * 8 + SECONDS_IN_DAY / 2
    ),
    swapStart: BigInt(SECONDS_TODAY - SECONDS_IN_DAY * 5),
    minCommitment: BigInt(1000 * 100000000),
    maxCommitment: BigInt(3000 * 100000000),
    minParticipationCommitment: BigInt(500000000),
    maxParticipationCommitment: BigInt(10000000000),
    tokenName: "Mario",

    logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACjSURBVHgB7dkxDkRAGEDh32ZPsuWWWy+JQ4gzimPolUpXIXMCM4nmjfcVqglegT+j+Xf9EZV5p8MyrZcL2/EX+7BFjs/8zVpbsi7nHpN0n6+okFEURlEYRVFlVPP4iaLkq37npFB6bZ8pCqMojKIwisKJomSP4s5zukcRvig4jKIwisKJgsK/HhRGURhFYRSFEwWFEwWFURRGURhFYRRFlWPSCah/Vck0pRWfAAAAAElFTkSuQmCC",
    name: "Super Mario",
    symbol: "SPM",
    url: "http://sns-super-mario-project.com",
    description:
      "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    swap: mockSwap,
  },
  {
    rootCanisterId: principal(3),

    swapDeadline: BigInt(
      SECONDS_TODAY + SECONDS_IN_DAY * 10 + SECONDS_IN_DAY / 3
    ),
    swapStart: BigInt(SECONDS_TODAY - SECONDS_IN_DAY * 3),
    minCommitment: BigInt(500 * 100000000),
    maxCommitment: BigInt(3000 * 100000000),
    minParticipationCommitment: BigInt(150000000),
    maxParticipationCommitment: BigInt(5000000000),
    tokenName: "Kong",

    logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC6SURBVHgB7ZkxCsJAFAUTETyAexcbEfZSHsJLBcTGu6wHsFK3SL0/EIvZzBSpHj87gYXHz3i+5M/QGfv6OB2mZvD5zqHcnC2lNHMppb+8ezd0iFIUlKKgFIUupcbNN4rpeB0i5Ndt1ZnRefNM7xQFpSgoRUEpCv02ijX3CZXoTmFJLnLGSj2nd4qCUhSUoqAUBXcUSxrF497O/j6ofz2iKEVBKQpKUbBRUHBHQUEpCkpRUIqCUhS6rElfBK1VyaWjTNYAAAAASUVORK5CYII=",
    name: "Donkey Kong",
    symbol: "DKG",
    url: "http://sns-donkey-kong-project.com",
    description:
      "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    swap: mockSwap,
  },
])
  // preserve indexes (important for unit tests)
  .map((summary, index) => ({
    ...summary,
    rootCanisterId: principal(index),
  })) as SnsSummary[];

export const mockSummary = mockSnsSummaryList[0];

export const mockSnsFullProject = {
  rootCanisterId: principal(0),
  summary: mockSummary,
  swapCommitment: mockSnsSwapCommitment(principal(0)),
} as SnsFullProject;

export const mockQuerySnsSwapState = {
  rootCanisterId: principal(0),
  swap: [
    {
      init: [
        {
          ...mockSnsSummaryList[0].swap.init,
        },
      ],
      state: [
        {
          ...mockSnsSummaryList[0].swap.state,
        },
      ],
    },
  ],
};

export const summaryForLifecycle = (lifecycle: SnsSwapLifecycle) => ({
  ...mockSnsFullProject.summary,
  swap: {
    ...mockSwap,
    state: {
      ...mockSwap.state,
      lifecycle,
    },
  },
});
