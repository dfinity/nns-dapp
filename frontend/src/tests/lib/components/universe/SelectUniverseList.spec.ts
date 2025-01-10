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
import { render } from "@testing-library/svelte";

describe("SelectUniverseList", () => {
  const projects = [
    {
      ...mockSnsFullProject,
      summary: mockSnsFullProject.summary.override({
        metadata: {
          ...mockSnsFullProject.summary.metadata,
          name: "project name",
        },
      }),
    },
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

  const renderComponent = ({ onSelect }: { onSelect?: () => void } = {}) => {
    const { container, component } = render(SelectUniverseList);
    if (onSelect) {
      component.$on("nnsSelectUniverse", onSelect);
    }
    return SelectUniverseListPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
      mockProjectSubscribe(projects)
    );
  });

  it("should render universe cards", async () => {
    const po = renderComponent();

    const cards = await po.getSelectUniverseCardPos();
    const names = await Promise.all(cards.map((card) => card.getName()));

    expect(names).toEqual([
      "Internet Computer",
      "another name",
      "ckBTC",
      "ckTESTBTC",
      "project name",
    ]);
  });

  it("should render project selected", async () => {
    const po = renderComponent();

    const cards = await po.getSelectUniverseCardPos();

    // The last card ("project name") is selected based on the current page set
    // in beforeEach.
    expect(await Promise.all(cards.map((card) => card.isSelected()))).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it("should trigger select project", async () => {
    const onSelect = vi.fn();
    const po = renderComponent({ onSelect });

    const cards = await po.getSelectUniverseCardPos();

    expect(onSelect).toBeCalledTimes(0);

    await cards[0].click();

    expect(onSelect).toBeCalledWith(
      new CustomEvent("nnsSelectUniverse", {
        detail: OWN_CANISTER_ID_TEXT,
        bubbles: false,
      })
    );
    expect(onSelect).toBeCalledTimes(1);

    await cards[1].click();

    expect(onSelect).toBeCalledWith(
      new CustomEvent("nnsSelectUniverse", {
        detail: principal(1).toText(),
        bubbles: false,
      })
    );
    expect(onSelect).toBeCalledTimes(2);
  });

  it("should not render ckBTC universe cards if route not accounts", async () => {
    page.mock({
      routeId: AppPath.Neurons,
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const po = renderComponent();

    const cards = await po.getSelectUniverseCardPos();
    const names = await Promise.all(cards.map((card) => card.getName()));

    expect(names).toEqual([
      "Internet Computer",
      "another name",
      "project name",
    ]);
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
