import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import Proposals from "$lib/routes/Proposals.svelte";
import { page } from "$mocks/$app/stores";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/$public/proposals.services", () => {
  return {
    listProposals: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/$public/sns-proposals.services", () => {
  return {
    loadSnsProposals: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/api/governance.api");

describe("Proposals", () => {
  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  beforeEach(() => {
    // Reset to default value
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  it("should render NnsProposals by default", () => {
    const { queryByTestId } = render(Proposals);
    expect(queryByTestId("nns-proposal-list-component")).toBeInTheDocument();
  });
});
