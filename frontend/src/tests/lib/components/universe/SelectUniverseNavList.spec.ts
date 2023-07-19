import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { page } from "$mocks/$app/stores";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("SelectUniverseNavList", () => {
  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  beforeEach(() => {
    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => vi.clearAllMocks());

  it("should render universe cards as links", () => {
    const { getAllByRole } = render(SelectUniverseNavList);
    // 1 for Sns project + 1 for Internet Computer / NNS + 1 for ckBTC + 1 for ckTESTBTC
    expect(getAllByRole("link").length).toEqual(4);
  });

  it("should navigate", async () => {
    const { getAllByTestId } = render(SelectUniverseNavList);

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[3]));

    const { universe } = get(pageStore);
    await waitFor(() =>
      expect(universe).toEqual(mockSnsFullProject.rootCanisterId.toText())
    );
  });

  it("should not render ckBTC cards as links if route not Accounts", () => {
    page.mock({
      routeId: AppPath.Neurons,
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getAllByRole } = render(SelectUniverseNavList);
    // 1 for Sns project + 1 for Internet Computer / NNS
    expect(getAllByRole("link").length).toEqual(2);
  });
});
