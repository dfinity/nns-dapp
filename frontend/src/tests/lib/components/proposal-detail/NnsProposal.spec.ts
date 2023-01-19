/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { mockProposalInfo } from "../../../mocks/proposal.mock";
import NnsProposalTest from "./NnsProposalTest.svelte";

jest.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

describe("Proposal", () => {
  const renderProposalModern = () =>
    render(NnsProposalTest, {
      props: {
        proposalInfo: mockProposalInfo,
      },
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
      expect(queryByTestId("proposal-proposer-info-title")).toBeInTheDocument()
    );
  });

  it("should render proposer proposal data", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(
        queryByTestId("proposal-proposer-actions-entry-title")
      ).toBeInTheDocument()
    );
  });
});
