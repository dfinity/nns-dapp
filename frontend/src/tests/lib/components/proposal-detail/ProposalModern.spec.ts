/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { mockProposalInfo } from "../../../mocks/proposal.mock";
import ProposalModernTest from "./ProposalModernTest.svelte";

jest.mock("../../../../lib/utils/html.utils", () => ({
  sanitizeHTML: (value) => Promise.resolve(value),
}));

describe("ProposalModern", () => {
  const renderProposalModern = (neuronsReady: boolean) =>
    render(ProposalModernTest, {
      props: {
        proposalInfo: mockProposalInfo,
        neuronsReady,
      },
    });

  it("should be hidden if neurons are not ready", async () => {
    const { queryByTestId } = renderProposalModern(false);
    await waitFor(() =>
      expect(queryByTestId("proposal-details-grid")).not.toBeInTheDocument()
    );
  });

  it("should be visible if neurons are ready", async () => {
    const { queryByTestId } = renderProposalModern(true);
    await waitFor(() =>
      expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
    );
  });

  it("should render system info", async () => {
    const { queryByTestId } = renderProposalModern(true);
    await waitFor(() =>
      expect(queryByTestId("proposal-system-info-details")).toBeInTheDocument()
    );
  });
});
