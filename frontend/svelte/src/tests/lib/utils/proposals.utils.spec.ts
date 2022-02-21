import type { ProposalInfo } from "@dfinity/nns";
import { Topic } from "@dfinity/nns";
import { enumKeys, enumValues } from "../../../lib/utils/enum.utils";
import {
  emptyProposals,
  excludeTopics,
  lastProposalId,
} from "../../../lib/utils/proposals.utils";

describe("proposals-utils", () => {
  const mockProposals: ProposalInfo[] = [
    {
      id: "test1",
    },
    { id: "test2" },
  ] as unknown as ProposalInfo[];

  it("should detect an empty list of proposals", () =>
    expect(emptyProposals([])).toBeTruthy());

  it("should detect an not empty list of proposals", () =>
    expect(emptyProposals(mockProposals)).toBeFalsy());

  it("should find no last proposal id", () =>
    expect(lastProposalId([])).toBeUndefined());

  it("should find a last proposal id", () =>
    expect(lastProposalId(mockProposals)).toEqual(
      mockProposals[mockProposals.length - 1].id
    ));

  it("should exclude all topics", () =>
    expect(excludeTopics([])).toEqual(enumValues(Topic)));

  it("should exclude no topics", () => {
    const all: Topic[] = enumKeys(Topic).map((key: string) => Topic[key]);

    expect(excludeTopics(all)).toEqual([]);
  });

  it("should exclude selected topics", () => {
    const results: Topic[] = [
      Topic.Unspecified,
      Topic.ManageNeuron,
      Topic.ExchangeRate,
      Topic.NetworkEconomics,
      Topic.Governance,
      Topic.NodeAdmin,
      Topic.ParticipantManagement,
      Topic.NetworkCanisterManagement,
      Topic.NodeProviderRewards,
    ];

    expect(excludeTopics([Topic.SubnetManagement, Topic.Kyc])).toEqual(results);
  });
});
