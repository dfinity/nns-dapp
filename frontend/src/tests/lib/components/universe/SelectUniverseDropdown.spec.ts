import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockStoreSubscribe } from "$tests/mocks/commont.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { SelectUniverseDropdownPo } from "$tests/page-objects/SelectUniverseDropdown.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "@testing-library/svelte";

describe("SelectUniverseDropdown", () => {
  vi.spyOn(snsProjectSelectedStore, "subscribe").mockImplementation(
    mockStoreSubscribe(mockSnsFullProject)
  );

  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  beforeEach(() => {
    vi.clearAllMocks();
    icrcAccountsStore.reset();
    resetSnsProjects();
    resetIdentity();

    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  const renderComponent = () => {
    const { container } = render(SelectUniverseDropdown);
    return SelectUniverseDropdownPo.under(new JestPageObjectElement(container));
  };

  it("should render a universe card with a role button", async () => {
    const po = renderComponent();

    expect(await po.getSelectUniverseCardPo().isPresent()).toBe(true);
    expect(await po.getSelectUniverseCardPo().isButton()).toBe(true);
  });

  it("should render logo of universe", async () => {
    const po = renderComponent();
    expect(await po.getSelectUniverseCardPo().getLogoSource()).toBe(
      mockSnsFullProject.summary.metadata.logo
    );
  });

  describe("no balance", () => {
    beforeEach(() => {
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Accounts,
      });
    });

    it("should render a skeleton on load balance", async () => {
      const po = renderComponent();
      expect(
        await po
          .getSelectUniverseCardPo()
          .getUniverseAccountsBalancePo()
          .isLoading()
      ).toBe(true);
    });
  });

  describe("balance", () => {
    beforeEach(() => {
      const accounts = [
        {
          ...mockSnsMainAccount,
          balanceUlps: 100_000_000n,
        },
        {
          ...mockSnsSubAccount,
          balanceUlps: 23_000_000n,
        },
      ];
      const rootCanisterId = mockSnsFullProject.rootCanisterId;
      const ledgerCanisterId = mockSnsFullProject.summary.ledgerCanisterId;

      setSnsProjects([
        {
          rootCanisterId,
          ledgerCanisterId,
          tokenMetadata: mockSnsToken,
        },
      ]);

      icrcAccountsStore.set({
        ledgerCanisterId,
        accounts: { accounts, certified: true },
      });

      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Accounts,
      });
    });

    it("should render total balance of the project", async () => {
      const po = renderComponent();
      expect(await po.getSelectUniverseCardPo().hasBalance()).toBe(true);
      // Expect 1.00 + 0.23
      expect(
        (
          await po
            .getSelectUniverseCardPo()
            .getUniverseAccountsBalancePo()
            .getText()
        ).trim()
      ).toBe("1.23 TST");
    });

    it("should not render balance when not signed in", async () => {
      setNoIdentity();

      const po = renderComponent();
      // Expect 1.00 + 0.23
      expect(await po.getSelectUniverseCardPo().hasBalance()).toBe(false);
    });

    it("should not render balance when not on accounts tab", async () => {
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Neurons,
      });

      const po = renderComponent();
      // Expect 1.00 + 0.23
      expect(await po.getSelectUniverseCardPo().hasBalance()).toBe(false);
    });
  });

  it("should open modal", async () => {
    const po = renderComponent();

    expect(await po.getSelectUniverseListPo().isPresent()).toBe(false);
    await po.getSelectUniverseCardPo().click();
    expect(await po.getSelectUniverseListPo().isPresent()).toBe(true);
  });
});
