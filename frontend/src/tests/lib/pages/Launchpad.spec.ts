/**
 * @jest-environment jsdom
 */

import Launchpad from "$lib/pages/Launchpad.svelte";
import { render } from "@testing-library/svelte";
import en from "../../mocks/i18n.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapCommitments: jest.fn().mockResolvedValue(Promise.resolve()),
    listSnsProposals: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("Launchpad", () => {
  afterEach(() => jest.clearAllMocks());
  it("should render titles", () => {
    jest
      .spyOn(committedProjectsStore, "subscribe")
      .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));
    const { getByText } = render(Launchpad);

    // TBU
    expect(getByText(en.sns_launchpad.open_projects)).toBeInTheDocument();
    expect(getByText(en.sns_launchpad.committed_projects)).toBeInTheDocument();
    expect(getByText(en.sns_launchpad.proposals)).toBeInTheDocument();
  });

  it("should not render committed project title if no committed projects", () => {
    jest
      .spyOn(committedProjectsStore, "subscribe")
      .mockImplementation(mockProjectSubscribe([]));
    const { queryByText } = render(Launchpad);

    // TBU
    expect(queryByText(en.sns_launchpad.open_projects)).toBeInTheDocument();
    expect(
      queryByText(en.sns_launchpad.committed_projects)
    ).not.toBeInTheDocument();
    expect(queryByText(en.sns_launchpad.proposals)).toBeInTheDocument();
  });
});
