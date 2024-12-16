import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import type { TableNeuron } from "$lib/types/neurons-table";
import { mockTableNeuron } from "$tests/mocks/neurons.mock";
import { NeuronsTablePo } from "$tests/page-objects/NeuronsTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronState } from "@dfinity/nns";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { get, writable, type Writable } from "svelte/store";

describe("NeuronsTable", () => {
  const makeStake = (amount: bigint) =>
    TokenAmountV2.fromUlps({
      amount,
      token: ICPToken,
    });

  const neuron1: TableNeuron = {
    ...mockTableNeuron,
    rowHref: "/neurons/10",
    domKey: "10",
    neuronId: "10",
  };

  const neuron2: TableNeuron = {
    ...mockTableNeuron,
    rowHref: "/neurons/99",
    domKey: "99",
    neuronId: "99",
  };

  const neuron3: TableNeuron = {
    ...mockTableNeuron,
    rowHref: "/neurons/200",
    domKey: "200",
    neuronId: "200",
  };

  const neuron4: TableNeuron = {
    ...mockTableNeuron,
    rowHref: "/neurons/1111",
    domKey: "1111",
    neuronId: "1111",
  };

  const spawningNeuron: TableNeuron = {
    ...mockTableNeuron,
    domKey: "101",
    neuronId: "101",
    stake: TokenAmountV2.fromUlps({
      amount: 0n,
      token: ICPToken,
    }),
    availableMaturity: 300_000_000n,
    dissolveDelaySeconds: BigInt(5 * SECONDS_IN_DAY),
    state: NeuronState.Spawning,
  };

  const renderComponent = ({
    neurons,
    neuronsStore,
  }: {
    neurons?: TableNeuron[];
    neuronsStore?: Writable<TableNeuron[]>;
  }) => {
    neurons ??= get(neuronsStore);
    const { container, component } = render(NeuronsTable, {
      neurons,
    });
    neuronsStore?.subscribe((neurons) => {
      component.$set({ neurons });
    });
    return NeuronsTablePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    neuronsTableOrderStore.reset();
  });

  it("should render desktop headers", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    expect(await po.getDesktopColumnHeaders()).toEqual([
      "Neurons",
      "",
      "Stake",
      "",
      "Maturity",
      "",
      "Dissolve Delay",
      "",
      "State",
      "", // No header for actions column.
    ]);
  });

  it("should render mobile headers", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    expect(await po.getMobileColumnHeaders()).toEqual([
      "Neurons",
      "", // No header for actions column.
    ]);
  });

  it("should render cell alignment classes", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    const rows = await po.getRows();
    expect(await rows[0].getCellAlignments()).toEqual([
      "desktop-align-left", // Neuron ID
      expect.any(String), // gap
      "desktop-align-right", // Stake
      expect.any(String), // gap
      "desktop-align-right", // Maturity
      expect.any(String), // gap
      "desktop-align-left", // Dissolve Delay
      expect.any(String), // gap
      "desktop-align-left", // State
      "desktop-align-right", // Actions
    ]);
  });

  it("should use correct template columns", async () => {
    const po = renderComponent({ neurons: [neuron1] });

    expect(await po.getDesktopGridTemplateColumns()).toBe(
      [
        "minmax(min-content, max-content)", // Neuron ID
        "1fr", // gap
        "max-content", // Stake
        "1fr", // gap
        "max-content", // Maturity
        "1fr", // gap
        "max-content", // State
        "1fr", // gap
        "max-content", // Dissolve Delay
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-1 cell-1" "cell-3 cell-3" "cell-5 cell-5" "cell-7 cell-7"'
    );
  });

  it("should render neuron URL", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getHref()).toBe(neuron1.rowHref);
    expect(await rowPos[1].getHref()).toBe(neuron2.rowHref);
  });

  it("should render neuron ID", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getNeuronId()).toBe(neuron1.neuronId);
    expect(await rowPos[1].getNeuronId()).toBe(neuron2.neuronId);
  });

  it("should render neuron stake", async () => {
    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          stake: makeStake(1_300_000_000n),
        },
        {
          ...neuron2,
          stake: makeStake(500_000_000n),
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getStake()).toBe("13.00 ICP");
    expect(await rowPos[1].getStake()).toBe("5.00 ICP");
  });

  it("should not render detailed neuron stake", async () => {
    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          stake: makeStake(999_990_000n),
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(1);
    expect(await rowPos[0].getStake()).toBe("10.00 ICP");
  });

  it("should render neuron stake in USD", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          stakeInUsd: 1234.56,
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(1);
    expect(await rowPos[0].getStakeInUsd()).toBe("$1’234.56");
    expect(await rowPos[0].hasStakeInUsd()).toBe(true);
  });

  it("should render absent neuron stake in USD", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          stakeInUsd: undefined,
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(1);
    expect(await rowPos[0].getStakeInUsd()).toBe("$-/-");
    expect(await rowPos[0].hasStakeInUsd()).toBe(true);
  });

  it("should not render neuron stake in USD if feature flag is disabled", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", false);

    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          stakeInUsd: 1234.56,
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(1);
    expect(await rowPos[0].hasStakeInUsd()).toBe(false);
  });

  it("should render neuron maturity", async () => {
    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          availableMaturity: 0n,
          stakedMaturity: 0n,
        },
        {
          ...neuron2,
          availableMaturity: 10_000_000n,
          stakedMaturity: 20_000_000n,
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getAvailableMaturity()).toBe("0");
    expect(await rowPos[0].getStakedMaturity()).toBe("0");
    expect(await rowPos[0].getTotalMaturity()).toBe("0");
    expect(await rowPos[1].getAvailableMaturity()).toBe("0.10");
    expect(await rowPos[1].getStakedMaturity()).toBe("0.20");
    expect(await rowPos[1].getTotalMaturity()).toBe("0.30");
  });

  it("should render neuron state", async () => {
    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          state: NeuronState.Dissolving,
        },
        {
          ...neuron2,
          state: NeuronState.Locked,
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getState()).toBe("Dissolving");
    expect(await rowPos[1].getState()).toBe("Locked");
  });

  it("should sort neurons", async () => {
    // Neurons passed in out of order ...
    const po = renderComponent({
      neurons: [
        {
          ...neuron2,
          stake: makeStake(800_000_000n),
        },
        {
          ...neuron4,
          stake: makeStake(600_000_000n),
        },
        {
          ...neuron1,
          stake: makeStake(900_000_000n),
        },
        {
          ...neuron3,
          stake: makeStake(700_000_000n),
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(4);
    // ... appear in the UI in sorted order.
    expect(await rowPos[0].getNeuronId()).toBe(neuron1.neuronId);
    expect(await rowPos[1].getNeuronId()).toBe(neuron2.neuronId);
    expect(await rowPos[2].getNeuronId()).toBe(neuron3.neuronId);
    expect(await rowPos[3].getNeuronId()).toBe(neuron4.neuronId);
  });

  it("should sort neurons tie breaking on ID", async () => {
    // Neurons passed in out of order ...
    const po = renderComponent({
      neurons: [
        {
          ...neuron3,
          stake: makeStake(300_000_000n),
        },
        {
          ...neuron4,
          stake: makeStake(300_000_000n),
        },
        {
          ...neuron2,
          stake: makeStake(800_000_000n),
        },
        {
          ...neuron1,
          stake: makeStake(800_000_000n),
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(4);
    // ... appear in the UI in sorted order.
    expect(await rowPos[0].getNeuronId()).toBe(neuron1.neuronId);
    expect(await rowPos[1].getNeuronId()).toBe(neuron2.neuronId);
    expect(await rowPos[2].getNeuronId()).toBe(neuron3.neuronId);
    expect(await rowPos[3].getNeuronId()).toBe(neuron4.neuronId);
  });

  it("should update table when neurons prop changes", async () => {
    const neuronsStore = writable([neuron1]);
    const po = renderComponent({
      neuronsStore,
    });
    expect(await po.getNeuronsTableRowPos()).toHaveLength(1);

    neuronsStore.set([neuron1, neuron2]);
    await runResolvedPromises();
    expect(await po.getNeuronsTableRowPos()).toHaveLength(2);
  });

  it("should change order based on order store", async () => {
    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          stake: makeStake(800_000_000n),
          dissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
        },
        {
          ...neuron2,
          stake: makeStake(800_000_000n),
          dissolveDelaySeconds: BigInt(6 * SECONDS_IN_MONTH),
        },
        {
          ...neuron3,
          stake: makeStake(300_000_000n),
          dissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
        },
        {
          ...neuron4,
          stake: makeStake(300_000_000n),
          dissolveDelaySeconds: BigInt(6 * SECONDS_IN_MONTH),
        },
      ],
    });
    {
      const rowPos = await po.getNeuronsTableRowPos();
      expect(rowPos).toHaveLength(4);
      expect(await rowPos[0].getNeuronId()).toBe(neuron1.neuronId);
      expect(await rowPos[1].getNeuronId()).toBe(neuron2.neuronId);
      expect(await rowPos[2].getNeuronId()).toBe(neuron3.neuronId);
      expect(await rowPos[3].getNeuronId()).toBe(neuron4.neuronId);
    }

    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
      },
      {
        columnId: "stake",
        reversed: true,
      },
    ]);
    await runResolvedPromises();

    {
      const rowPos = await po.getNeuronsTableRowPos();
      expect(rowPos).toHaveLength(4);
      expect(await rowPos[0].getNeuronId()).toBe(neuron3.neuronId);
      expect(await rowPos[1].getNeuronId()).toBe(neuron1.neuronId);
      expect(await rowPos[2].getNeuronId()).toBe(neuron4.neuronId);
      expect(await rowPos[3].getNeuronId()).toBe(neuron2.neuronId);
    }
  });

  it("should change order store based on clicked header", async () => {
    const po = renderComponent({
      neurons: [neuron1, neuron2, neuron3, neuron4],
    });

    expect(get(neuronsTableOrderStore)).toEqual([
      { columnId: "stake" },
      { columnId: "dissolveDelay" },
    ]);

    await po.clickColumnHeader("Stake");
    expect(get(neuronsTableOrderStore)).toEqual([
      { columnId: "stake", reversed: true },
      { columnId: "dissolveDelay" },
    ]);

    // The Neuron ID column is not sortable so clicking it does not change the
    // order.
    await po.clickColumnHeader("Neurons");
    expect(get(neuronsTableOrderStore)).toEqual([
      { columnId: "stake", reversed: true },
      { columnId: "dissolveDelay" },
    ]);

    await po.clickColumnHeader("Maturity");
    expect(get(neuronsTableOrderStore)).toEqual([
      { columnId: "maturity" },
      { columnId: "stake", reversed: true },
      { columnId: "dissolveDelay" },
    ]);

    await po.clickColumnHeader("Dissolve Delay");
    expect(get(neuronsTableOrderStore)).toEqual([
      { columnId: "dissolveDelay" },
      { columnId: "maturity" },
      { columnId: "stake", reversed: true },
    ]);

    await po.clickColumnHeader("State");
    expect(get(neuronsTableOrderStore)).toEqual([
      { columnId: "state" },
      { columnId: "dissolveDelay" },
      { columnId: "maturity" },
      { columnId: "stake", reversed: true },
    ]);
  });

  it("should render dissolve delay", async () => {
    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          stake: makeStake(800_000_000n),
          dissolveDelaySeconds: BigInt(6 * SECONDS_IN_MONTH),
        },
        {
          ...neuron2,
          stake: makeStake(300_000_000n),
          dissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getDissolveDelay()).toBe("182 days, 15 hours");
    expect(await rowPos[1].getDissolveDelay()).toBe("8 years");
  });

  it("should render go-to-detail button iff there is a URL", async () => {
    const po = renderComponent({ neurons: [neuron1, spawningNeuron] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getHref()).toBe(neuron1.rowHref);
    expect(await rowPos[0].hasGoToDetailButton()).toBe(true);
    expect(await rowPos[1].getHref()).toBe(null);
    expect(await rowPos[1].hasGoToDetailButton()).toBe(false);
  });

  it("should have a tooltip for spawning neurons", async () => {
    const po = renderComponent({ neurons: [neuron1, spawningNeuron] });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getNeuronStateCellPo().isTooltipEnabled()).toBe(
      false
    );
    expect(await rowPos[1].getNeuronStateCellPo().isTooltipEnabled()).toBe(
      true
    );
    expect(await rowPos[1].getNeuronStateCellPo().getTooltipText()).toBe(
      "When this neuron has finished spawning, newly minted ICP will be added. The quantity of new ICP minted will depend on the ICP price trend. You will then be able to disburse this new ICP if you wish."
    );
  });

  it("should render a different style for spawning neuron rows", async () => {
    const po = renderComponent({ neurons: [neuron1, spawningNeuron] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getTableRowTextColorVariable()).toBe("");
    expect(await rowPos[1].getTableRowTextColorVariable()).toBe(
      "var(--text-description-tint)"
    );
  });

  it("should render a different style for spawning neuron rows tooltip icon", async () => {
    const po = renderComponent({ neurons: [neuron1, spawningNeuron] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getTableRowTooltipColorVariable()).toBe("");
    expect(await rowPos[1].getTableRowTooltipColorVariable()).toBe(
      "var(--table-row-text-color)"
    );
  });

  it("should render tags", async () => {
    const tagTexts = ["Neuron's fund", "Hotkey control"];
    const tags = tagTexts.map((text) => ({ text }));
    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          tags: [],
        },
        {
          ...neuron2,
          tags,
        },
      ],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    const cell1 = rowPos[0].getNeuronIdCellPo();
    expect(await cell1.getTags()).toEqual([]);
    expect(await cell1.hasTagsElement()).toBe(false);
    const cell2 = rowPos[1].getNeuronIdCellPo();
    expect(await cell2.getTags()).toEqual(tagTexts);
    expect(await cell2.hasTagsElement()).toBe(true);
  });

  it("should render visibility icon and tooltip for public neuron", async () => {
    const po = renderComponent({
      neurons: [
        {
          ...neuron1,
          isPublic: true,
        },
        {
          ...neuron2,
        },
      ],
    });

    const visibilityTooltipPo = (
      await po.getNeuronsTableRowPo(neuron1.neuronId)
    )
      .getNeuronIdCellPo()
      .getPublicNeuronTooltipPo();

    expect(await visibilityTooltipPo.isPresent()).toBe(true);
    expect(await visibilityTooltipPo.getTooltipText()).toBe("Neuron is public");
  });
});
