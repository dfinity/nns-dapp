/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import ProposalProposerActionsEntry from "../../../../lib/components/proposal-detail/ProposalProposerActionsEntry.svelte";
import { proposalPayloadsStore } from "../../../../lib/stores/proposals.store";
import { getNnsFunctionKey } from "../../../../lib/utils/proposals.utils";
import en from "../../../mocks/i18n.mock";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "../../../mocks/proposal.mock";

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionNnsFunction21,
} as Proposal;

describe("ProposalProposerActionsEntry", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  nnsDappMock.getProposalPayload.mockResolvedValue({});
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  beforeEach(() => proposalPayloadsStore.reset);

  afterAll(jest.clearAllMocks);

  it("should render nnsFunction id", () => {
    const { getByText } = render(ProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
      },
    });

    const [key, value] = Object.entries(
      (
        proposalWithNnsFunctionAction?.action as {
          ExecuteNnsFunction: object;
        }
      ).ExecuteNnsFunction
    )[0];

    expect(getByText(key)).toBeInTheDocument();
    expect(getByText(value)).toBeInTheDocument();
  });

  it("should render nnsFunction name", () => {
    const { getByText } = render(ProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
      },
    });

    const nnsFunctionKey = getNnsFunctionKey(proposalWithNnsFunctionAction);
    const fnName = en.nns_functions[nnsFunctionKey as string];

    expect(getByText(fnName)).toBeInTheDocument();
  });

  it("should trigger getProposalPayload", async () => {
    const spyGetProposalPayload = jest
      .spyOn(nnsDappMock, "getProposalPayload")
      .mockImplementation(async () => ({}));

    render(ProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
      },
    });

    await waitFor(() => expect(spyGetProposalPayload).toBeCalledTimes(1));
  });
});
