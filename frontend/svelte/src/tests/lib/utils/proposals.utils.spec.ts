import type { ProposalInfo } from "@dfinity/nns";
import {
  emptyProposals,
  lastProposalId,
  proposalActionFields,
  proposalFirstActionKey,
} from "../../../lib/utils/proposals.utils";
import { mockProposalInfo } from "../../mocks/proposal.mock";

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

  it("should find fist action key", () =>
    expect(proposalFirstActionKey(mockProposalInfo.proposal)).toEqual(
      "ExecuteNnsFunction"
    ));

  describe("proposalActionFields", () => {
    it("should filter action fields", () => {
      const fields = proposalActionFields(mockProposalInfo.proposal);

      expect(fields.map(([key]) => key).join()).toEqual(
        "nnsFunctionId,nnsFunctionName,payload"
      );
    });

    it("should mock payload formatting", () => {
      const fields = proposalActionFields(mockProposalInfo.proposal);
      const payload = fields.find(([key]) => key === "payload")[1];
      expect(payload).toEqual(
        '{data_source: {"icp":["Binance"],"sdr":"fixer.io"}, timestamp_seconds: 200}'
      );
    });
  });
});
