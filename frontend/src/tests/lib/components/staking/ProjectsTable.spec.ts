import * as icpSwapApi from "$lib/api/icp-swap.api";
import ProjectsTable from "$lib/components/staking/ProjectsTable.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { projectsTableOrderStore } from "$lib/stores/projects-table.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { ProjectsTablePo } from "$tests/page-objects/ProjectsTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setIcpSwapUsdPrices } from "$tests/utils/icp-swap.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

describe("ProjectsTable", () => {
  const snsTitle = "SNS-1";
  const snsCanisterId = principal(1111);
  const snsLedgerCanisterId = principal(1112);
  const snsTokenSymbol = "TOK";

  const renderComponent = ({ onNnsStakeTokens = null } = {}) => {
    const { container } = render(ProjectsTable, {
      props: {},
      events: {
        ...(nonNullish(onNnsStakeTokens) && {
          nnsStakeTokens: ({ detail }) => onNnsStakeTokens({ detail }),
        }),
      },
    });

    return ProjectsTablePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();

    page.mock({
      routeId: AppPath.Staking,
    });
    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
        ledgerCanisterId: snsLedgerCanisterId,
        tokenMetadata: {
          ...mockSnsToken,
          symbol: snsTokenSymbol,
        },
      },
    ]);
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([]);
  });

  it("should render desktop headers", async () => {
    const po = renderComponent();
    expect(await po.getDesktopColumnHeaders()).toEqual([
      "Nervous Systems",
      "",
      "Stake",
      "",
      "Maturity",
      "",
      "Neurons",
      "", // No header for actions column.
    ]);
  });

  it("should render mobile headers", async () => {
    const po = renderComponent();
    expect(await po.getMobileColumnHeaders()).toEqual([
      "Nervous Systems",
      "", // No header for actions column.
    ]);
  });

  it("should render cell alignment classes", async () => {
    const po = renderComponent();
    const rows = await po.getRows();
    expect(await rows[0].getCellAlignments()).toEqual([
      "desktop-align-left", // Nervous Systems
      expect.any(String), // gap
      "desktop-align-right", // Stake
      expect.any(String), // gap
      "desktop-align-right", // Maturity
      expect.any(String), // gap
      "desktop-align-right", // Neurons
      "desktop-align-right", // Actions
    ]);
  });

  it("should use correct template columns", async () => {
    const po = renderComponent();

    expect(await po.getDesktopGridTemplateColumns()).toBe(
      [
        "minmax(min-content, max-content)", // Nervous Systems
        "1fr", // gap
        "max-content", // Stake
        "1fr", // gap
        "max-content", // Maturity
        "1fr", // gap
        "max-content", // Neurons
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-1 cell-1" "cell-3 cell-3" "cell-5 cell-5"'
    );
  });

  it("should render project title", async () => {
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getProjectTitle()).toBe("Internet Computer");
    expect(await rowPos[1].getProjectTitle()).toBe(snsTitle);
  });

  it("should render stake as -/- when neurons not loaded", async () => {
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getStake()).toBe("-/- ICP");
    expect(await rowPos[1].getStake()).toBe("-/- TOK");
  });

  it("should not render stake when user has no neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: snsCanisterId,
      neurons: [],
      certified: true,
    });
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getStake()).toBe("");
    expect(await rowPos[1].getStake()).toBe("");
  });

  it("should render maturity as -/- when neurons not loaded", async () => {
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getProjectMaturityCellPo().getText()).toBe("-/-");
    expect(await rowPos[1].getProjectMaturityCellPo().getText()).toBe("-/-");
  });

  it("should not render maturity when user has no neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: snsCanisterId,
      neurons: [],
      certified: true,
    });
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getProjectMaturityCellPo().getText()).toBe("");
    expect(await rowPos[1].getProjectMaturityCellPo().getText()).toBe("");
  });

  describe("with neurons", () => {
    const nnsNeuronStake = 100_000_000n;
    const nnsAvailableMaturity = 30_000_000n;
    const nnsStakedMaturity = 40_000_000n;
    const snsNeuronStake = 200_000_000n;
    const snsAvailableMaturity = 50_000_000n;
    const snsStakedMaturity = 60_000_000n;

    const nnsNeuronWithStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: nnsNeuronStake,
        maturityE8sEquivalent: nnsAvailableMaturity,
        stakedMaturityE8sEquivalent: nnsStakedMaturity,
      },
    };

    const nnsNeuronWithoutStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 0n,
        maturityE8sEquivalent: 0n,
        stakedMaturityE8sEquivalent: 0n,
      },
    };

    const snsNeuronWithStake = createMockSnsNeuron({
      stake: snsNeuronStake,
      maturity: snsAvailableMaturity,
      stakedMaturity: snsStakedMaturity,
      id: [1, 1, 3],
    });

    const snsNeuronWithoutStake = createMockSnsNeuron({
      stake: 0n,
      maturity: 0n,
      stakedMaturity: 0n,
      id: [7, 7, 9],
    });

    it("should render stake", async () => {
      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [snsNeuronWithStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getStake()).toBe("1.00 ICP");
      expect(await rowPos[1].getStake()).toBe("2.00 TOK");
    });

    it("should render maturity", async () => {
      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [snsNeuronWithStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      // 0.30 + 0.40 = 0.70
      expect(
        await rowPos[0].getProjectMaturityCellPo().getTotalMaturity()
      ).toBe("0.70");
      // 0.50 + 0.60 = 1.10
      expect(
        await rowPos[1].getProjectMaturityCellPo().getTotalMaturity()
      ).toBe("1.10");
    });

    it("should render NNS neurons count", async () => {
      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake, nnsNeuronWithStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPo = await po.getRowByTitle("Internet Computer");
      expect(await rowPo.getNeuronCount()).toBe("2");
      expect(await rowPo.getHref()).toBe(`/neurons/?u=${OWN_CANISTER_ID_TEXT}`);
      expect(await rowPo.hasGoToNeuronsTableAction()).toBe(true);
    });

    it("should render SNS neurons count", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [snsNeuronWithStake, snsNeuronWithStake, snsNeuronWithStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPo = await po.getRowByTitle(snsTitle);
      expect(await rowPo.getNeuronCount()).toBe("3");
      expect(await rowPo.getHref()).toBe(`/neurons/?u=${snsCanisterId}`);
      expect(await rowPo.hasGoToNeuronsTableAction()).toBe(true);
    });

    it("should filter NNS neurons without stake", async () => {
      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake, nnsNeuronWithoutStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getNeuronCount()).toBe("1");
    });

    it("should filter SNS neurons without stake", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [
          snsNeuronWithStake,
          snsNeuronWithoutStake,
          snsNeuronWithStake,
        ],
        certified: true,
      });
      const po = renderComponent();
      const rowPo = await po.getRowByTitle(snsTitle);
      expect(await rowPo.getNeuronCount()).toBe("2");
    });

    it("should not render neurons count when not signed in", async () => {
      setNoIdentity();
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getNeuronCount()).toBe("-/-");
      expect(await rowPos[0].getHref()).toBe(null);
      expect(await rowPos[0].hasGoToNeuronsTableAction()).toBe(false);
      expect(await rowPos[1].getNeuronCount()).toBe("-/-");
      expect(await rowPos[1].getHref()).toBe(null);
      expect(await rowPos[1].hasGoToNeuronsTableAction()).toBe(false);
    });

    it("should not render SNS neurons count when not loaded", async () => {
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getNeuronCount()).toBe("-/-");
      expect(await rowPos[0].getHref()).toBe(null);
      expect(await rowPos[0].hasGoToNeuronsTableAction()).toBe(false);
      expect(await rowPos[1].getNeuronCount()).toBe("-/-");
      expect(await rowPos[1].getHref()).toBe(null);
      expect(await rowPos[1].hasGoToNeuronsTableAction()).toBe(false);
    });

    it("should render stake button with zero neurons", async () => {
      neuronsStore.setNeurons({
        neurons: [],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [],
        certified: true,
      });
      const onNnsStakeTokens = vi.fn();
      const po = renderComponent({ onNnsStakeTokens });
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getStakeButtonPo().isPresent()).toBe(true);
      expect(await rowPos[0].getNeuronCount()).toBe("Stake ICP");
      expect(await rowPos[0].getHref()).toBe(null);
      expect(await rowPos[0].hasGoToNeuronsTableAction()).toBe(true);

      expect(onNnsStakeTokens).not.toBeCalled();
      await rowPos[0].getStakeButtonPo().click();
      expect(onNnsStakeTokens).toBeCalledTimes(1);
      expect(onNnsStakeTokens).toBeCalledWith({
        detail: {
          universeId: OWN_CANISTER_ID_TEXT,
        },
      });

      expect(await rowPos[1].getStakeButtonPo().isPresent()).toBe(true);
      expect(await rowPos[1].getNeuronCount()).toBe("Stake TOK");
      expect(await rowPos[1].getHref()).toBe(null);
      expect(await rowPos[1].hasGoToNeuronsTableAction()).toBe(true);

      await rowPos[1].getStakeButtonPo().click();
      expect(onNnsStakeTokens).toBeCalledTimes(2);
      expect(onNnsStakeTokens).toBeCalledWith({
        detail: {
          universeId: snsCanisterId.toText(),
        },
      });
    });

    it("should dispatch nnsStakeTokens on row click with zero neurons", async () => {
      neuronsStore.setNeurons({
        neurons: [],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [],
        certified: true,
      });
      const onNnsStakeTokens = vi.fn();
      const po = renderComponent({ onNnsStakeTokens });
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);

      expect(onNnsStakeTokens).not.toBeCalled();
      await rowPos[0].click();
      expect(onNnsStakeTokens).toBeCalledTimes(1);
      expect(onNnsStakeTokens).toBeCalledWith({
        detail: {
          universeId: OWN_CANISTER_ID_TEXT,
        },
      });

      await rowPos[1].click();
      expect(onNnsStakeTokens).toBeCalledTimes(2);
      expect(onNnsStakeTokens).toBeCalledWith({
        detail: {
          universeId: snsCanisterId.toText(),
        },
      });
    });

    it("should not dispatch nnsStakeTokens on row click when not signed in", async () => {
      setNoIdentity();
      neuronsStore.setNeurons({
        neurons: [],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [],
        certified: true,
      });
      const onNnsStakeTokens = vi.fn();
      const po = renderComponent({ onNnsStakeTokens });
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);

      expect(onNnsStakeTokens).not.toBeCalled();
      await rowPos[0].click();
      expect(onNnsStakeTokens).not.toBeCalled();

      await rowPos[1].click();
      expect(onNnsStakeTokens).not.toBeCalled();
    });

    it("should not dispatch nnsStakeTokens on row click when neurons not loaded", async () => {
      const onNnsStakeTokens = vi.fn();
      const po = renderComponent({ onNnsStakeTokens });
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);

      expect(onNnsStakeTokens).not.toBeCalled();
      await rowPos[0].click();
      expect(onNnsStakeTokens).not.toBeCalled();

      await rowPos[1].click();
      expect(onNnsStakeTokens).not.toBeCalled();
    });

    it("should display stake in USD", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      const tickers = [
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "10.00",
        },
      ];
      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);

      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });

      expect(get(icpSwapTickersStore)).toBeUndefined();
      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

      const po = renderComponent();
      await runResolvedPromises();

      expect(get(icpSwapTickersStore)).toEqual(tickers);
      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);

      const rowPos = await po.getProjectsTableRowPos();
      expect(await rowPos[0].getStake()).toBe("1.00 ICP");
      expect(await rowPos[0].getStakeInUsd()).toBe("$10.00");
      expect(await rowPos[0].hasStakeInUsd()).toBe(true);
    });

    it("should not load ICP Swap tickers without feature flag", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", false);

      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([]);

      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });

      expect(get(icpSwapTickersStore)).toBeUndefined();
      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

      const po = renderComponent();
      await runResolvedPromises();

      expect(get(icpSwapTickersStore)).toBeUndefined();
      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

      const rowPos = await po.getProjectsTableRowPos();
      expect(await rowPos[0].getStake()).toBe("1.00 ICP");
      expect(await rowPos[0].hasStakeInUsd()).toBe(false);
    });

    it("should not load ICP Swap tickers when not signed in", async () => {
      setNoIdentity();
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([]);

      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });

      expect(get(icpSwapTickersStore)).toBeUndefined();
      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

      const po = renderComponent();
      await runResolvedPromises();

      expect(get(icpSwapTickersStore)).toBeUndefined();
      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

      const rowPos = await po.getProjectsTableRowPos();
      expect(await rowPos[0].getStake()).toBe("-/- ICP");
      expect(await rowPos[0].getStakeInUsd()).toBe("$-/-");
    });

    it("should not show total USD value banner when the user has no neurons", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      neuronsStore.setNeurons({
        neurons: [],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [],
        certified: true,
      });

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(false);
    });

    it("should not show total USD value banner when feature flag is disabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", false);

      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(false);
    });

    it("should not show total USD value banner when not logged in", async () => {
      setNoIdentity();
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(false);
    });

    it("should show total stake in USD", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [snsNeuronWithStake],
        certified: true,
      });

      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "10.00",
        },
        {
          ...mockIcpSwapTicker,
          base_id: snsLedgerCanisterId.toText(),
          last_price: "100.00",
        },
      ]);

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
      // The NNS neuron has a stake of 1 and the SNS neurons a stake of 2.
      // There are 10 USD in 1 ICP and 100 SNS tokens in 1 ICP.
      // So each SNS token is $0.10.
      expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$10.20");

      expect(
        await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
      ).toBe(false);
      expect(
        await po.getUsdValueBannerPo().getIcpExchangeRatePo().getTooltipText()
      ).toBe(
        "1 ICP = $10.00 Token prices are in ckUSDC based on data provided by ICPSwap."
      );
    });

    it("should ignore tokens with unknown balance in USD when adding up the total", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [snsNeuronWithStake],
        certified: true,
      });

      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "10.00",
        },
        // SNS token price is missing.
      ]);

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
      expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$10.00");

      // The tooltip indicates that some token prices are unknown.
      expect(
        await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
      ).toBe(true);
    });

    it("should show total USD banner when tickers fail to load", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [snsNeuronWithStake],
        certified: true,
      });

      const error = new Error("ICPSwap failed");
      vi.spyOn(console, "error").mockReturnValue();
      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockRejectedValue(error);

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
      expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$-/-");
      expect(
        await po.getUsdValueBannerPo().getIcpExchangeRatePo().getTooltipText()
      ).toBe(
        "ICPSwap API is currently unavailable, token prices cannot be fetched at the moment."
      );
      expect(console.error).toBeCalledWith(error);
      expect(console.error).toBeCalledTimes(1);
    });

    it("should order by stake by default", async () => {
      const po = renderComponent();

      expect(get(projectsTableOrderStore)).toEqual([
        {
          columnId: "stake",
        },
        {
          columnId: "title",
        },
      ]);

      expect(await po.getColumnHeaderWithArrow()).toBe("Stake");
    });

    it("should change order based on order store", async () => {
      const po = renderComponent();
      expect(await po.getColumnHeaderWithArrow()).toBe("Stake");

      projectsTableOrderStore.set([
        {
          columnId: "title",
        },
      ]);

      expect(await po.getColumnHeaderWithArrow()).toBe("Nervous Systems");
    });

    it("should change order store based on clicked header", async () => {
      const po = renderComponent();
      expect(await po.getColumnHeaderWithArrow()).toBe("Stake");

      expect(get(projectsTableOrderStore)).toEqual([
        {
          columnId: "stake",
        },
        {
          columnId: "title",
        },
      ]);

      await po.clickColumnHeader("Neurons");

      expect(get(projectsTableOrderStore)).toEqual([
        {
          columnId: "neurons",
        },
        {
          columnId: "stake",
        },
        {
          columnId: "title",
        },
      ]);
    });

    describe("Nns neurons missing rewards badge", () => {
      it("should render the badge in Nns row", async () => {
        overrideFeatureFlagsStore.setFlag(
          "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
          true
        );
        neuronsStore.setNeurons({
          neurons: [nnsNeuronWithStake],
          certified: true,
        });
        snsNeuronsStore.setNeurons({
          rootCanisterId: snsCanisterId,
          neurons: [snsNeuronWithStake],
          certified: true,
        });
        const po = renderComponent();
        const [firstRow, secondRow] = await po.getProjectsTableRowPos();

        expect(await firstRow.getHref()).toBe(
          `/neurons/?u=${OWN_CANISTER_ID_TEXT}`
        );
        expect(
          await firstRow
            .getProjectTitleCellPo()
            .getNnsNeuronsMissingRewardsBadgePo()
            .isPresent()
        ).toBe(true);
        expect(await secondRow.getHref()).toBe(`/neurons/?u=${snsCanisterId}`);
        expect(
          await secondRow
            .getProjectTitleCellPo()
            .getNnsNeuronsMissingRewardsBadgePo()
            .isPresent()
        ).toBe(false);
      });

      it("should not render the badge when feature flag off", async () => {
        overrideFeatureFlagsStore.setFlag(
          "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
          false
        );
        neuronsStore.setNeurons({
          neurons: [nnsNeuronWithStake],
          certified: true,
        });
        const po = renderComponent();
        const [firstRow] = await po.getProjectsTableRowPos();

        expect(await firstRow.getHref()).toBe(
          `/neurons/?u=${OWN_CANISTER_ID_TEXT}`
        );
        expect(
          await firstRow
            .getProjectTitleCellPo()
            .getNnsNeuronsMissingRewardsBadgePo()
            .isPresent()
        ).toBe(false);
      });
    });
  });

  it("should update table when universes store changes", async () => {
    const po = renderComponent();

    await runResolvedPromises();
    expect(await po.getProjectsTableRowPos()).toHaveLength(2);

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
      {
        projectName: "Another SNS",
        rootCanisterId: principal(2222),
      },
    ]);

    await runResolvedPromises();
    expect(await po.getProjectsTableRowPos()).toHaveLength(3);
  });

  it("should sort projects by stake in USD, with unpriced neurons before no neuron and then alphabetically with ICP before the rest", async () => {
    const snsNeuronWithStake = createMockSnsNeuron({
      stake: 100_000_000n,
      id: [1, 1, 3],
    });
    const rootCanisterId1 = principal(101);
    const rootCanisterId2 = principal(102);
    const rootCanisterId3 = principal(103);
    const rootCanisterId4 = principal(104);
    const rootCanisterId5 = principal(105);
    const rootCanisterId6 = principal(106);
    const ledgerCanisterId5 = principal(205);
    const ledgerCanisterId6 = principal(206);
    setSnsProjects([
      {
        projectName: "A without neurons",
        rootCanisterId: rootCanisterId1,
      },
      {
        projectName: "B with neurons",
        rootCanisterId: rootCanisterId2,
      },
      {
        projectName: "X without neurons",
        rootCanisterId: rootCanisterId3,
      },
      {
        projectName: "Z with neurons",
        rootCanisterId: rootCanisterId4,
      },
      {
        projectName: "C with less USD",
        rootCanisterId: rootCanisterId5,
        ledgerCanisterId: ledgerCanisterId5,
      },
      {
        projectName: "D with more USD",
        rootCanisterId: rootCanisterId6,
        ledgerCanisterId: ledgerCanisterId6,
      },
    ]);
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId1,
      neurons: [],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId2,
      neurons: [snsNeuronWithStake],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId3,
      neurons: [],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId4,
      neurons: [snsNeuronWithStake],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId5,
      neurons: [snsNeuronWithStake],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId6,
      neurons: [snsNeuronWithStake],
      certified: true,
    });

    setIcpSwapUsdPrices({
      [ledgerCanisterId5.toText()]: 1,
      [ledgerCanisterId6.toText()]: 2,
    });

    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(7);
    expect(
      await Promise.all(rowPos.map((project) => project.getProjectTitle()))
    ).toEqual([
      "D with more USD",
      "C with less USD",
      "B with neurons",
      "Z with neurons",
      "Internet Computer",
      "A without neurons",
      "X without neurons",
    ]);
  });

  it("should not disable sorting on mobile", async () => {
    const po = renderComponent();
    expect(await po.getOpenSortModalButtonPo().isPresent()).toBe(true);
  });
});
