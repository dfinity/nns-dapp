/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import ProposalActions from "../../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalActions.svelte";
import { proposalPayloadsStore } from "../../../../../lib/stores/proposals.store";
import {
  getNnsFunctionId,
  proposalFirstActionKey,
} from "../../../../../lib/utils/proposals.utils";
import en from "../../../../mocks/i18n.mock";
import {
  mockProposalInfo,
  proposalActionMotion,
  proposalActionNnsFunction21,
  proposalActionRewardNodeProvider,
} from "../../../../mocks/proposal.mock";

const proposalWithMotionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionMotion,
} as Proposal;

const proposalWithRewardNodeProviderAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionRewardNodeProvider,
} as Proposal;

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionNnsFunction21,
} as Proposal;

describe("ProposalActions", () => {
  it("should render action key", () => {
    const { getByText } = render(ProposalActions, {
      props: {
        proposal: proposalWithMotionAction,
      },
    });

    const key = proposalFirstActionKey(proposalWithMotionAction) as string;
    expect(getByText(key)).toBeInTheDocument();
  });

  it("should render action fields", () => {
    const { getByText } = render(ProposalActions, {
      props: {
        proposal: proposalWithMotionAction,
      },
    });

    const [key, value] = Object.entries(
      (proposalWithMotionAction?.action as { Motion: object }).Motion
    )[0];
    expect(getByText(key)).toBeInTheDocument();
    expect(getByText(value)).toBeInTheDocument();
  });

  it("should render object fields as JSON", () => {
    const nodeProviderActions = render(ProposalActions, {
      props: {
        proposal: proposalWithRewardNodeProviderAction,
      },
    });

    expect(nodeProviderActions.queryAllByTestId("json").length).toBe(2);
  });

  it("should render text fields as plane text", () => {
    const motionActions = render(ProposalActions, {
      props: {
        proposal: proposalWithMotionAction,
      },
    });

    expect(motionActions.queryAllByTestId("json").length).toBe(0);
  });

  describe("nnsFunction", () => {
    const nnsDappMock = mock<NNSDappCanister>();
    nnsDappMock.getProposalPayload.mockResolvedValue({});
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    beforeEach(() => proposalPayloadsStore.reset);

    afterAll(jest.clearAllMocks);

    it("should render nnsFunction id", () => {
      const { getByText } = render(ProposalActions, {
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
      const { getByText } = render(ProposalActions, {
        props: {
          proposal: proposalWithNnsFunctionAction,
        },
      });

      const id = getNnsFunctionId(proposalWithNnsFunctionAction);
      const fnName = en.nns_function_names[`${id}`];

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
});
