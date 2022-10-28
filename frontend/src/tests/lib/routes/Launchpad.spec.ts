/**
 * @jest-environment jsdom
 */

import Launchpad from "$lib/routes/Launchpad.svelte";
import { render } from "@testing-library/svelte";
import en from "../../mocks/i18n.mock";

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapCommitments: jest.fn().mockResolvedValue(Promise.resolve()),
    listSnsProposals: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("Launchpad", () => {
  it("should render titles", () => {
    const { getByText } = render(Launchpad);

    // TBU
    expect(getByText(en.sns_launchpad.open_projects)).toBeInTheDocument();
    expect(getByText(en.sns_launchpad.committed_projects)).toBeInTheDocument();
    expect(getByText(en.sns_launchpad.proposals)).toBeInTheDocument();
  });
});
