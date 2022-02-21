import type { ProposalId, ProposalInfo } from "@dfinity/nns";
import { Topic } from "@dfinity/nns";
import { enumKeys, enumsKeys } from "./enum.utils";

export const emptyProposals = ({ length }: ProposalInfo[]): boolean =>
  length <= 0;

export const lastProposalId = (
  proposalInfos: ProposalInfo[]
): ProposalId | undefined => {
  const { length, [length - 1]: last } = proposalInfos;
  return last?.id;
};

export const excludeTopics = (topics: Topic[]): Topic[] => {
  const keys: string[] = enumsKeys<Topic>({
    obj: Topic as unknown as Topic,
    values: topics,
  });

  return enumKeys(Topic)
    .filter((key: string) => !keys.includes(key))
    .map((key: string) => Topic[key]);
};
