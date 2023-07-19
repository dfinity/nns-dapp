import * as proposalsApi from "$lib/api/proposals.api";
import { filteredProposals } from "$lib/derived/proposals.derived";
import {
  generateMockProposals,
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "$tests/mocks/proposal.mock";
import { createMockProposalsStoreSubscribe } from "$tests/mocks/proposals.store.mock";
import { ProposalNavigationPo } from "$tests/page-objects/ProposalNavigation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { render, waitFor } from "@testing-library/svelte";
import NnsProposalTest from "./NnsProposalTest.svelte";

vi.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

vi.mock("$lib/api/nns-dapp.api");

describe("Proposal", () => {
  blockAllCallsTo(["$lib/api/nns-dapp.api"]);

  const renderProposalModern = (id = 1000n) =>
    render(NnsProposalTest, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          id,
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

  it("should render proposal navigation", async () => {
    vi.spyOn(filteredProposals, "subscribe").mockImplementation(
      createMockProposalsStoreSubscribe(generateMockProposals(10))
    );

    const { container } = renderProposalModern(5n);
    const po = ProposalNavigationPo.under(new JestPageObjectElement(container));

    expect(await po.getOlderButtonPo().isPresent()).toBe(true);
    expect(await po.getNewerButtonPo().isPresent()).toBe(true);
  });
});
