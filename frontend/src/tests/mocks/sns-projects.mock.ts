import { Principal } from "@dfinity/principal";
import {
  SnsSwapLifecycle,
  type SnsSwapDerivedState,
  type SnsSwapState,
} from "@dfinity/sns";
import type { Subscriber } from "svelte/store";
import type { SnsFullProject } from "../../lib/stores/projects.store";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "../../lib/types/sns";
import { secondsToDate, secondsToTime } from "../../lib/utils/date.utils";
import { shuffle } from "../../lib/utils/dev.utils";

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

export const createBuyersState = (amount: bigint) => ({
  icp_disbursing: false,
  amount_sns_e8s: BigInt(0),
  amount_icp_e8s: amount,
  sns_disbursing: false,
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

export const buildMockSwapInit = (
  rootCanisterId: string = principal(0).toText()
) => ({
  sns_root_canister_id: rootCanisterId,
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
});

export const mockSwapInit = buildMockSwapInit();

export const mockSwapTimeWindow = {
  start_timestamp_seconds: BigInt(SECONDS_TODAY + 60 * 5),
  end_timestamp_seconds: BigInt(SECONDS_TODAY + SECONDS_IN_DAY * 5),
};

export const mockSwapTimeWindowText = {
  start_timestamp_seconds: `${secondsToDate(
    Number(mockSwapTimeWindow.start_timestamp_seconds)
  )} ${secondsToTime(Number(mockSwapTimeWindow.start_timestamp_seconds))}`,
  end_timestamp_seconds: `${secondsToDate(
    Number(mockSwapTimeWindow.end_timestamp_seconds)
  )} ${secondsToTime(Number(mockSwapTimeWindow.end_timestamp_seconds))}`,
};

export const mockSwapState = {
  open_time_window: [mockSwapTimeWindow],
  sns_token_e8s: BigInt(1000),
  lifecycle: SnsSwapLifecycle.Open,
  buyers: [],
} as SnsSwapState;

export const buildMockSwap = (
  rootCanisterId: string = principal(0).toText()
): SnsSummarySwap => ({
  init: buildMockSwapInit(rootCanisterId),
  state: mockSwapState,
});

export const mockSwap = buildMockSwap();

export const mockDerived: SnsSwapDerivedState = {
  buyer_total_icp_e8s: BigInt(100 * 100000000),
  sns_tokens_per_icp: 1,
};

export const mockMetadata: SnsSummaryMetadata = {
  url: "http://sns-tetris-project.com",
  logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACzSURBVHgB7ZrBCcIwAEUTcYSMI6KC2H2cw30UQRwoO1Ry6DkptMhL3zvk9C7vEPiExMPxPIbO2Jcj51wVU0pN3hy3eN/Pu+qdLtcmb3J3oUOMomAUBaModBkVN78oXukZWrjlwUWxNEZRMIqCURRcFBT+vijWeB/xTlEwioJRFIyi4KKYsyha3OKNj7oX74OLwigKRlEwioKLgsJq/yhal8KS3uR6pygYRcEoCkZRcCZR+AGaGlXJPd3qegAAAABJRU5ErkJggg==",
  name: "Tetris",
  description:
    "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
};

export const mockSnsSummaryList: SnsSummary[] = shuffle([
  {
    rootCanisterId: principal(0),
    swapCanisterId: principal(3),

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
    metadata: mockMetadata,
    swap: buildMockSwap(),
    derived: mockDerived,
  },
  {
    rootCanisterId: principal(1),
    swapCanisterId: principal(2),

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
    metadata: {
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAClSURBVHgB7dqxDYMwEEBRE2UET5I6icQUzMgc9EziHUAuqLElS+if/iuoruAXyCeL6fufjxTMuz5KKbeDOee0rXtq8Vs+TbM9cy3vWNX3fKWAjKIwisIoipBRU9iNYuTp3zM7eu6a9ZuiMIrCKAqjKNwoek711nuPkXPXrN8UhVEURlEYReFG4R3Fg4yiMIrCKAo3Cgr/o6AwisIoCqMojKIIuSadjJ5VyRrmqP4AAAAASUVORK5CYII=",
      name: "Pac-Man",
      url: "http://sns-pac-man-project.com",
      description:
        "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    },
    swap: buildMockSwap(principal(1).toText()),
    derived: mockDerived,
  },
  {
    rootCanisterId: principal(2),
    swapCanisterId: principal(1),

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
    metadata: {
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACjSURBVHgB7dkxDkRAGEDh32ZPsuWWWy+JQ4gzimPolUpXIXMCM4nmjfcVqglegT+j+Xf9EZV5p8MyrZcL2/EX+7BFjs/8zVpbsi7nHpN0n6+okFEURlEYRVFlVPP4iaLkq37npFB6bZ8pCqMojKIwisKJomSP4s5zukcRvig4jKIwisKJgsK/HhRGURhFYRSFEwWFEwWFURRGURhFYRRFlWPSCah/Vck0pRWfAAAAAElFTkSuQmCC",
      name: "Super Mario",
      url: "http://sns-super-mario-project.com",
      description:
        "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    },
    swap: buildMockSwap(principal(2).toText()),
    derived: mockDerived,
  },
  {
    rootCanisterId: principal(3),
    swapCanisterId: principal(0),

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
    metadata: {
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC6SURBVHgB7ZkxCsJAFAUTETyAexcbEfZSHsJLBcTGu6wHsFK3SL0/EIvZzBSpHj87gYXHz3i+5M/QGfv6OB2mZvD5zqHcnC2lNHMppb+8ezd0iFIUlKKgFIUupcbNN4rpeB0i5Ndt1ZnRefNM7xQFpSgoRUEpCv02ijX3CZXoTmFJLnLGSj2nd4qCUhSUoqAUBXcUSxrF497O/j6ofz2iKEVBKQpKUbBRUHBHQUEpCkpRUIqCUhS6rElfBK1VyaWjTNYAAAAASUVORK5CYII=",
      name: "Donkey Kong",
      url: "http://sns-donkey-kong-project.com",
      description:
        "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    },
    swap: buildMockSwap(principal(3).toText()),
    derived: mockDerived,
  },
])
  // preserve indexes (important for unit tests)
  .map((summary, index) => ({
    ...summary,
    rootCanisterId: principal(index),
  })) as SnsSummary[];

export const mockSummary = mockSnsSummaryList[0];

export const mockSwapCommitment = mockSnsSwapCommitment(
  principal(0)
) as SnsSwapCommitment;

export const mockSnsFullProject = {
  rootCanisterId: principal(0),
  summary: mockSummary,
  swapCommitment: mockSwapCommitment,
} as SnsFullProject;

export const summaryForLifecycle = (
  lifecycle: SnsSwapLifecycle
): SnsSummary => ({
  ...mockSnsFullProject.summary,
  swap: {
    ...mockSwap,
    state: {
      ...buildMockSwap().state,
      lifecycle,
    },
  },
});
