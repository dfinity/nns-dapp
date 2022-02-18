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

export const proposalActionFields = (
  proposal: Proposal
): [string, string][] => {
  const key = proposalFirstActionKey(proposal);
  if (!key) {
    return [];
  }

  /** Mock the flutter dapp json renderer  */
  const formatPayload = (payload: object) => {
    const fields = Object.entries(payload)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return `{${fields}}`;
  };
  return Object.entries(proposal.action[key])
    .filter(([key]) => key !== "payloadBytes")
    .map(([key, value]: [string, object]) => [
      key,
      key === "payload" ? formatPayload(value) : `${value}`,
    ]);
};
