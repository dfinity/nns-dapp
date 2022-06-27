import type { Principal } from "@dfinity/principal";

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

  deadline: bigint; // seconds
  minCommitment: bigint; // e8s
  maxCommitment: bigint; // e8s

  status: SnsProjectStatus;
}

export interface SnsSwapState {
  rootCanisterId: Principal;
  myCommitment: bigint | undefined; // e8s
  currentCommitment: bigint; // e8s
}
