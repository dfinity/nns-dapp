/**
 * @jest-environment jsdom
 */

import Launchpad from "$lib/pages/Launchpad.svelte";
import { authStore } from "$lib/stores/auth.store";
import { committedProjectsStore } from "$lib/stores/projects.store";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    listSnsProposals: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSwapCommitments: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("Launchpad", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  beforeAll(() =>
    authStoreMock.next({
      identity: mockIdentity,
    })
  );

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
