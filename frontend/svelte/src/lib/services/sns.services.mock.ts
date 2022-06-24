import { Principal } from "@dfinity/principal";

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

// utils
export const mockWaiting = <T>(generator: () => T): Promise<T> =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve(generator()),
      Math.round((0.5 + Math.random() * 4.5) * 1000)
    )
  );

/**
 * MOCK TYPES AND DATA
 */

// https://www.notion.so/SNS-MVP-Stories-e27f9f7d66cc4f93ad7b41f9ae8f0ead#f3b110e2adb041688d3abfff2a3666b5
export enum SnsProjectStatus {
  Opportunity = 0,
  Upcoming = 1,
}

export interface SnsSummary {
  rootCanisterId: Principal;

  logo: string;
  name: string;
  symbol: string;
  url: string;

  tokenName: string;
  description: string;

  deadline: BigInt; // seconds
  minCommitment: BigInt; // e8s
  maxCommitment: BigInt; // e8s

  status: SnsProjectStatus;
}

export interface SnsSwapState {
  rootCanisterId: Principal;
  myCommitment: BigInt; // e8s
  currentCommitment: BigInt; // e8s
}

export const SNS_SWAP_STATES_MAP: Record<string, SnsSwapState> = {
  [principal(0).toText()]: {
    rootCanisterId: principal(0),
    myCommitment: BigInt(25),
    currentCommitment: BigInt(100),
  },
  [principal(1).toText()]: {
    rootCanisterId: principal(1),
    myCommitment: BigInt(25),
    currentCommitment: BigInt(775),
  },
  [principal(2).toText()]: {
    rootCanisterId: principal(2),
    myCommitment: BigInt(0),
    currentCommitment: BigInt(1000),
  },
  [principal(3).toText()]: {
    rootCanisterId: principal(3),
    myCommitment: BigInt(0),
    currentCommitment: BigInt(500),
  },
};

const SECONDS_IN_DAY = 60 * 60 * 24;
const SECONDS_TODAY = +new Date(new Date().toJSON().split("T")[0]);

export const SNS_SUMMARY_LIST: SnsSummary[] = [
  {
    rootCanisterId: principal(0),
    status: SnsProjectStatus.Opportunity,

    deadline: BigInt(SECONDS_TODAY + SECONDS_IN_DAY * 3),
    minCommitment: BigInt(1500),
    maxCommitment: BigInt(3000),
    tokenName: "string",

    logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACzSURBVHgB7ZrBCcIwAEUTcYSMI6KC2H2cw30UQRwoO1Ry6DkptMhL3zvk9C7vEPiExMPxPIbO2Jcj51wVU0pN3hy3eN/Pu+qdLtcmb3J3oUOMomAUBaModBkVN78oXukZWrjlwUWxNEZRMIqCURRcFBT+vijWeB/xTlEwioJRFIyi4KKYsyha3OKNj7oX74OLwigKRlEwioKLgsJq/yhal8KS3uR6pygYRcEoCkZRcCZR+AGaGlXJPd3qegAAAABJRU5ErkJggg==",
    name: "Tetris",
    symbol: "TET",
    url: "http://sns-tetris-project.com",
    description:
      "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  },
  {
    rootCanisterId: principal(1),
    status: SnsProjectStatus.Opportunity,

    deadline: BigInt(SECONDS_TODAY + SECONDS_IN_DAY * 30),
    minCommitment: BigInt(1000),
    maxCommitment: BigInt(2000),
    tokenName: "string",

    logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAClSURBVHgB7dqxDYMwEEBRE2UET5I6icQUzMgc9EziHUAuqLElS+if/iuoruAXyCeL6fufjxTMuz5KKbeDOee0rXtq8Vs+TbM9cy3vWNX3fKWAjKIwisIoipBRU9iNYuTp3zM7eu6a9ZuiMIrCKAqjKNwoek711nuPkXPXrN8UhVEURlEYReFG4R3Fg4yiMIrCKAo3Cgr/o6AwisIoCqMojKIIuSadjJ5VyRrmqP4AAAAASUVORK5CYII=",
    name: "Pac-Man",
    symbol: "PAC",
    url: "http://sns-pac-man-project.com",
    description:
      "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  },
  {
    rootCanisterId: principal(2),
    status: SnsProjectStatus.Upcoming,

    // what needs to be shown for upcomming projects
    deadline: BigInt(SECONDS_TODAY + SECONDS_IN_DAY * 10),
    minCommitment: BigInt(1500),
    maxCommitment: BigInt(3000),
    tokenName: "string",

    logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACjSURBVHgB7dkxDkRAGEDh32ZPsuWWWy+JQ4gzimPolUpXIXMCM4nmjfcVqglegT+j+Xf9EZV5p8MyrZcL2/EX+7BFjs/8zVpbsi7nHpN0n6+okFEURlEYRVFlVPP4iaLkq37npFB6bZ8pCqMojKIwisKJomSP4s5zukcRvig4jKIwisKJgsK/HhRGURhFYRSFEwWFEwWFURRGURhFYRRFlWPSCah/Vck0pRWfAAAAAElFTkSuQmCC",
    name: "Super Mario",
    symbol: "SPM",
    url: "http://sns-super-mario-project.com",
    description:
      "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  },
  {
    rootCanisterId: principal(3),
    status: SnsProjectStatus.Upcoming,

    deadline: BigInt(SECONDS_TODAY + SECONDS_IN_DAY * 10),
    minCommitment: BigInt(1500),
    maxCommitment: BigInt(3000),
    tokenName: "string",

    logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA0CAYAAAAqunDVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC6SURBVHgB7ZkxCsJAFAUTETyAexcbEfZSHsJLBcTGu6wHsFK3SL0/EIvZzBSpHj87gYXHz3i+5M/QGfv6OB2mZvD5zqHcnC2lNHMppb+8ezd0iFIUlKKgFIUupcbNN4rpeB0i5Ndt1ZnRefNM7xQFpSgoRUEpCv02ijX3CZXoTmFJLnLGSj2nd4qCUhSUoqAUBXcUSxrF497O/j6ofz2iKEVBKQpKUbBRUHBHQUEpCkpRUIqCUhS6rElfBK1VyaWjTNYAAAAASUVORK5CYII=",
    name: "Donkey Kong",
    symbol: "DKG",
    url: "http://sns-donkey-kong-project.com",
    description:
      "Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  },
];
