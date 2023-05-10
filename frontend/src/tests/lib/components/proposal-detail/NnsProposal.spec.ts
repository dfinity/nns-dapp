import * as proposalsApi from "$lib/api/proposals.api";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "$tests/mocks/proposal.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";
import NnsProposalTest from "./NnsProposalTest.svelte";

vi.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

vi.mock("$lib/api/nns-dapp.api");

describe("Proposal", () => {
  blockAllCallsTo(["$lib/api/nns-dapp.api"]);

  const renderProposalModern = () =>
    render(NnsProposalTest, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          proposal: {
            ...mockProposalInfo.proposal,
            action: proposalActionNnsFunction21,
          },
        },
      },
    });

  beforeEach(() => {
    vi.spyOn(proposalsApi, "queryProposalPayload").mockResolvedValue({});
  });

  it("should render a detail grid", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
    );
  });

  it("should render system info", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(queryByTestId("proposal-system-info-details")).toBeInTheDocument()
    );
  });

  it("should render proposer proposal info", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(queryByTestId("proposal-summary-title")).toBeInTheDocument()
    );
  });

  it("should render proposer proposal actions entry", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(
        queryByTestId("proposal-proposer-actions-entry-title")
      ).toBeInTheDocument()
    );
  });

  it("should render proposer proposal payload entry", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(
        queryByTestId("proposal-proposer-payload-entry-title")
      ).toBeInTheDocument()
    );
  });
});
