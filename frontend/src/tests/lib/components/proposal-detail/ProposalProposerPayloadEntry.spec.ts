/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import ProposalActions from "../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalActions.svelte";
import { proposalPayloadsStore } from "../../../../lib/stores/proposals.store";
import { getExecuteNnsFunctionId } from "../../../../lib/utils/proposals.utils";
import en from "../../../mocks/i18n.mock";
import {
  mockProposalInfo,
  proposalActionMotion,
  proposalActionNnsFunction21,
} from "../../../mocks/proposal.mock";

const proposalWithMotionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionMotion,
} as Proposal;

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
    const { getByText } = render(ProposalActions, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
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
    const { getByText } = render(ProposalActions, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    const id = getExecuteNnsFunctionId(proposalWithNnsFunctionAction);
    const fnName = en.execute_nns_functions[`${id}`];

    expect(getByText(fnName)).toBeInTheDocument();
  });

  it("should trigger getProposalPayload", async () => {
    const spyGetProposalPayload = jest
      .spyOn(nnsDappMock, "getProposalPayload")
      .mockImplementation(async () => ({}));

    render(ProposalActions, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: BigInt(0),
      },
    });

    await waitFor(() => expect(spyGetProposalPayload).toBeCalledTimes(1));
  });
});
