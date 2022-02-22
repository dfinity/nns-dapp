import type { Proposal, ProposalId, ProposalInfo } from "@dfinity/nns";

export const emptyProposals = ({ length }: ProposalInfo[]): boolean =>
  length <= 0;

export const lastProposalId = (
  proposalInfos: ProposalInfo[]
): ProposalId | undefined => {
  const { length, [length - 1]: last } = proposalInfos;
  return last?.id;
};

export const proposalFirstActionKey = (proposal: Proposal) =>
  Object.keys(proposal?.action)[0];

/** Mock the flutter dapp json renderer  */
const formatProposalActionPayload = (payload: object) => {
  if (!payload) return "";
  const fields = Object.entries(payload)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
  return `{${fields}}`;
};

export const proposalActionFields = (
  proposal: Proposal
): [string, string][] => {
  const key = proposalFirstActionKey(proposal);
  if (!key) {
    return [];
  }

  return Object.entries(proposal.action[key])
    .filter(([key]) => key !== "payloadBytes")
    .map(([key, value]: [string, object]) => [
      key,
      key === "payload" ? formatProposalActionPayload(value) : `${value}`,
    ]);
};

// TODO: replace w/ markdown renderer -- eg https://nns.ic0.app/#/proposal/43574
export const formatProposalSummary = (summary: string): string => {
  if (!summary) return "";
  // extend urls
  return summary.replace(
    /(https?:\/\/[\S]+)/g,
    '<a target="_blank" href="$1">$1</a>'
  );
};
