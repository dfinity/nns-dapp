import SelectUniverseList from "$lib/components/universe/SelectUniverseList.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { SelectUniverseListPo } from "$tests/page-objects/SelectUniverseList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { fireEvent, render } from "@testing-library/svelte";

describe("SelectUniverseList", () => {
  const projects = [
    mockSnsFullProject,
    {
      ...mockSnsFullProject,
      rootCanisterId: principal(1),
      summary: mockSnsFullProject.summary.override({
        rootCanisterId: principal(1),
        metadata: {
          ...mockSnsFullProject.summary.metadata,
          name: "another name",
        },
      }),
    },
  ];

  const renderComponent = () => {
    const { container } = render(SelectUniverseList);
    return SelectUniverseListPo.under(new JestPageObjectElement(container));
  };

  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe(projects)
  );

  beforeEach(() => {
    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should render universe cards", () => {
    const { getAllByTestId } = render(SelectUniverseList);
    // +1 for Internet Computer / NNS and +1 for ckBTC +1 for ckTESTBTC
    expect(getAllByTestId("select-universe-card").length).toEqual(
      projects.length + 3
    );
  });

  it("should render project selected", () => {
    const { container } = render(SelectUniverseList);
    const card = container.querySelector(".selected");
    expect(card?.textContent.trim() ?? "").toEqual(
      projects[0].summary.metadata.name
    );
    expect(card?.textContent.trim() ?? "").not.toEqual(
      projects[1].summary.metadata.name
    );
  });

  it("should trigger select project", async () => {
    const { component, getAllByTestId } = render(SelectUniverseList);

    const onSelect = vi.fn();
    component.$on("nnsSelectUniverse", onSelect);

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[0]));

    expect(onSelect).toHaveBeenCalled();
  });

  it("should not render ckBTC universe cards if route not accounts", () => {
    page.mock({
      routeId: AppPath.Neurons,
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getAllByTestId } = render(SelectUniverseList);
    // +1 for Internet Computer / NNS
    expect(getAllByTestId("select-universe-card").length).toEqual(
      projects.length + 1
    );
  });

  describe('"all actionable" card', () => {
    it('should render "Actionable proposals" card', async () => {
      resetIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT, actionable: true },
        routeId: AppPath.Proposals,
      });

      const po = renderComponent();
      const cardPos = await po.getSelectUniverseCardPos();
      // +1 for IC and +1 for "Actionable Proposals" entry
      expect(cardPos.length).toEqual(projects.length + 2);
      expect(await cardPos[0].getName()).toEqual("Actionable Proposals");
      expect(await po.hasSeparator()).toEqual(true);
    });

    it('should not render "Actionable proposals" card when signedOut', async () => {
      setNoIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT, actionable: true },
        routeId: AppPath.Proposals,
      });

      const po = renderComponent();
      const cardPos = await po.getSelectUniverseCardPos();
      const titles = (
        await Promise.all(cardPos.map((card) => card.getText()))
      ).map((text) => text.trim());
      // +1 for IC
      expect(cardPos.length).toEqual(projects.length + 1);
      expect(titles.includes("Actionable Proposals")).toEqual(false);
      expect(await po.hasSeparator()).toEqual(false);
    });
  });
});
