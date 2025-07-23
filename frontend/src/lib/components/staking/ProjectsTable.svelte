<script lang="ts">
  import ApyCard from "$lib/components/portfolio/ApyCard.svelte";
  import ApyFallbackCard from "$lib/components/portfolio/ApyFallbackCard.svelte";
  import HideZeroNeuronsToggle from "$lib/components/staking/HideZeroNeuronsToggle.svelte";
  import ProjectActionsCell from "$lib/components/staking/ProjectActionsCell.svelte";
  import ProjectMaturityCell from "$lib/components/staking/ProjectMaturityCell.svelte";
  import ProjectNeuronsCell from "$lib/components/staking/ProjectNeuronsCell.svelte";
  import ProjectStakeCell from "$lib/components/staking/ProjectStakeCell.svelte";
  import ProjectTitleCell from "$lib/components/staking/ProjectTitleCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import {
    abandonedProjectsCanisterId,
    OWN_CANISTER_ID_TEXT,
  } from "$lib/constants/canister-ids.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
  import { tokensListVisitorsStore } from "$lib/derived/tokens-list-visitors.derived";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { failedActionableSnsesStore } from "$lib/stores/actionable-sns-proposals.store";
  import {
    ENABLE_APY_PORTFOLIO,
    ENABLE_NEW_TABLES,
  } from "$lib/stores/feature-flags.store";
  import { governanceMetricsStore } from "$lib/stores/governance-metrics.store";
  import { hideZeroNeuronsStore } from "$lib/stores/hide-zero-neurons.store";
  import { i18n } from "$lib/stores/i18n";
  import { networkEconomicsStore } from "$lib/stores/network-economics.store";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { nnsTotalVotingPowerStore } from "$lib/stores/nns-total-voting-power.store";
  import { projectsTableOrderStore } from "$lib/stores/projects-table.store";
  import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { ProjectsTableColumn, TableProject } from "$lib/types/staking";
  import {
    getStakingRewardData,
    isStakingRewardDataReady,
  } from "$lib/utils/staking-rewards.utils";
  import {
    compareByNeuron,
    compareByProject,
    compareByStake,
    getTableProjects,
    getTotalStakeInUsd,
    sortTableProjects,
  } from "$lib/utils/staking.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import { IconNeuronsPage } from "@dfinity/gix-components";
  import { isNullish, nonNullish, TokenAmountV2 } from "@dfinity/utils";
  import { createEventDispatcher, onDestroy } from "svelte";

  $effect(() => {
    if ($authSignedInStore) {
      loadIcpSwapTickers();
    }
  });

  const commonColumns: ProjectsTableColumn[] = $derived([
    {
      id: "stake",
      title: $i18n.neuron_detail.stake,
      cellComponent: ProjectStakeCell,
      alignment: "right",
      templateColumns: ["1fr"],
      comparator: $authSignedInStore ? compareByStake : undefined,
    },
    {
      title: $i18n.neuron_detail.maturity_title,
      cellComponent: ProjectMaturityCell,
      alignment: "right",
      templateColumns: ["1fr"],
    },
    {
      id: "neurons",
      title: $i18n.neurons.title,
      cellComponent: ProjectNeuronsCell,
      alignment: "right",
      templateColumns: ["1fr"],
      comparator: $authSignedInStore ? compareByNeuron : undefined,
    },
    {
      title: "",
      cellComponent: ProjectActionsCell,
      alignment: "right",
      templateColumns: ["1fr"],
    },
  ]);

  const columns: ProjectsTableColumn[] = $derived([
    {
      id: "title",
      title: $i18n.staking.nervous_systems,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["2fr"],
      comparator: $authSignedInStore ? compareByProject : undefined,
    },
    ...commonColumns,
  ]);

  const nnsColumns: ProjectsTableColumn[] = $derived([
    {
      id: "title",
      title: $i18n.staking.nervous_systems_nns,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["2fr"],
      comparator: $authSignedInStore ? compareByProject : undefined,
    },
    ...commonColumns,
  ]);

  const snsColumns: ProjectsTableColumn[] = $derived([
    {
      id: "title",
      title: $i18n.staking.nervous_systems_sns,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["2fr"],
      comparator: $authSignedInStore ? compareByProject : undefined,
    },
    ...commonColumns,
  ]);

  const sunsettedSnsColumns: ProjectsTableColumn[] = $derived([
    {
      id: "title",
      title: $i18n.staking.nervous_systems_sns_sunset,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["2fr"],
    },
    {
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
  ]);

  const tableProjects = $derived(
    getTableProjects({
      universes: $selectableUniversesStore,
      isSignedIn: $authSignedInStore,
      nnsNeurons: $neuronsStore?.neurons,
      snsNeurons: $snsNeuronsStore,
      icpSwapUsdPrices: $icpSwapUsdPricesStore,
      failedActionableSnses: $failedActionableSnsesStore,
    })
  );

  const shouldHideProjectsWithoutNeurons = $derived(
    $authSignedInStore && $hideZeroNeuronsStore === "hide"
  );

  const visibleTableProjects = $derived(
    shouldHideProjectsWithoutNeurons
      ? tableProjects.filter(
          ({ neuronCount = 0, universeId }) =>
            universeId === OWN_CANISTER_ID_TEXT || neuronCount > 0
        )
      : tableProjects
  );

  const sortedTableProjects = $derived(sortTableProjects(visibleTableProjects));

  const hasAnyNeurons = $derived(
    tableProjects.some((project) => (project.neuronCount ?? 0) > 0)
  );

  const totalStakeInUsd = $derived(getTotalStakeInUsd(tableProjects));

  const hasUnpricedTokens = $derived(
    tableProjects.some(
      (project) =>
        project.stake instanceof TokenAmountV2 &&
        project.stake.toUlps() > 0n &&
        (!("stakeInUsd" in project) || isNullish(project.stakeInUsd))
    )
  );

  const nnsNeurons = $derived(
    sortedTableProjects.filter(
      (project) => project.universeId === OWN_CANISTER_ID_TEXT
    )
  );

  const snsNeurons = $derived(
    sortedTableProjects
      .filter((p) => p.universeId !== OWN_CANISTER_ID_TEXT)
      .filter((p) => !abandonedProjectsCanisterId.includes(p.universeId))
  );

  const sunsetSns = $derived(
    sortedTableProjects.filter((p) =>
      abandonedProjectsCanisterId.includes(p.universeId)
    )
  );

  const dispatcher = createEventDispatcher();

  const handleAction = ({
    detail: { rowData },
  }: {
    detail: { rowData: TableProject };
  }) => {
    dispatcher("nnsStakeTokens", { universeId: rowData.universeId });
  };

  const showAll = () => {
    hideZeroNeuronsStore.set("show");
  };

  // =============================
  // APY CARD DATA
  // =============================

  const userTokens = $derived($tokensListVisitorsStore);
  const totalStakedInUsd = $derived(getTotalStakeInUsd(tableProjects));
  const totalTokensBalanceInUsd = $derived(getTotalBalanceInUsd(userTokens));
  const totalUsdAmount = $derived(
    $authSignedInStore ? totalTokensBalanceInUsd + totalStakedInUsd : undefined
  );

  let stakingRewardData = $state(
    getStakingRewardData({
      auth: $authSignedInStore,
      tokens: $tokensListUserStore,
      snsProjects: $snsAggregatorStore,
      snsNeurons: $snsNeuronsStore,
      nnsNeurons: $neuronsStore,
      nnsEconomics: $networkEconomicsStore,
      fxRates: $icpSwapUsdPricesStore,
      governanceMetrics: $governanceMetricsStore,
      nnsTotalVotingPower: $nnsTotalVotingPowerStore,
    })
  );

  let debounceTimer: ReturnType<typeof setTimeout>;
  let prevAuthState = $authSignedInStore;

  $effect(() => {
    clearTimeout(debounceTimer);
    const refreshData = () =>
      (stakingRewardData = getStakingRewardData({
        auth: $authSignedInStore,
        tokens: userTokens,
        snsProjects: $snsAggregatorStore,
        snsNeurons: $snsNeuronsStore,
        nnsNeurons: $neuronsStore,
        nnsEconomics: $networkEconomicsStore,
        fxRates: $icpSwapUsdPricesStore,
        governanceMetrics: $governanceMetricsStore,
        nnsTotalVotingPower: $nnsTotalVotingPowerStore,
      }));

    if ($authSignedInStore !== prevAuthState) {
      // No debounce if auth state changes, refresh immediately
      prevAuthState = $authSignedInStore;
      refreshData();
    } else {
      debounceTimer = setTimeout(refreshData, 500);
    }
  });

  onDestroy(() => {
    clearTimeout(debounceTimer);
  });

  $effect(() => {
    console.log({
      stakingRewardData,
      userTokens,
      isStakingRewardDataReady: isStakingRewardDataReady(stakingRewardData),
      totalUsdAmount,
    });
  });
</script>

<div class="wrapper" data-tid="projects-table-component">
  <div class="top">
    {#if $authSignedInStore}
      {#if hasAnyNeurons}
        <UsdValueBanner usdAmount={totalStakeInUsd} {hasUnpricedTokens}>
          <IconNeuronsPage slot="icon" />
        </UsdValueBanner>
      {/if}

      {#if $ENABLE_APY_PORTFOLIO && nonNullish(totalUsdAmount)}
        {#if isStakingRewardDataReady(stakingRewardData)}
          <ApyCard
            onStakingPage={true}
            rewardBalanceUSD={stakingRewardData.rewardBalanceUSD}
            rewardEstimateWeekUSD={stakingRewardData.rewardEstimateWeekUSD}
            stakingPower={stakingRewardData.stakingPower}
            stakingPowerUSD={stakingRewardData.stakingPowerUSD}
            totalAmountUSD={totalUsdAmount}
          />
        {:else}
          <ApyFallbackCard {stakingRewardData} />
        {/if}
      {/if}
    {/if}
  </div>

  {#if $ENABLE_NEW_TABLES}
    {#if !$authSignedInStore}
      <ResponsiveTable
        tableData={nnsNeurons}
        columns={nnsColumns}
        on:nnsAction={handleAction}
      />

      <ResponsiveTable
        tableData={snsNeurons}
        columns={snsColumns}
        on:nnsAction={handleAction}
      />

      {#if sunsetSns.length > 0}
        <ResponsiveTable tableData={sunsetSns} columns={sunsettedSnsColumns} />
      {/if}
    {:else}
      <ResponsiveTable
        tableData={nnsNeurons}
        columns={nnsColumns}
        on:nnsAction={handleAction}
        bind:order={$projectsTableOrderStore}
        displayTableSettings
        testId="nns-projects-table-component"
      >
        <svelte:fragment slot="settings-popover">
          <HideZeroNeuronsToggle />
          <Separator spacing="none" />
        </svelte:fragment>

        <div
          slot="last-row"
          class="last-row"
          class:hidden={!shouldHideProjectsWithoutNeurons}
        >
          {#if shouldHideProjectsWithoutNeurons}
            <div class="show-all-button-container">
              {$i18n.staking.hide_no_neurons_table_hint}
              <button
                data-tid="show-all-button"
                class="ghost show-all"
                on:click={showAll}
              >
                {$i18n.staking.show_all}</button
              >
            </div>
          {/if}
        </div>
      </ResponsiveTable>

      {#if snsNeurons.length > 0}
        <ResponsiveTable
          tableData={snsNeurons}
          columns={snsColumns}
          on:nnsAction={handleAction}
          bind:order={$projectsTableOrderStore}
          displayTableSettings
          testId="sns-projects-table-component"
        >
          <svelte:fragment slot="settings-popover">
            <HideZeroNeuronsToggle />
            <Separator spacing="none" />
          </svelte:fragment>
        </ResponsiveTable>
      {/if}

      {#if $hideZeroNeuronsStore !== "hide" && sunsetSns.length > 0}
        <ResponsiveTable tableData={sunsetSns} columns={sunsettedSnsColumns} />
      {/if}
    {/if}
  {:else if !$authSignedInStore}
    <ResponsiveTable
      tableData={sortedTableProjects}
      {columns}
      on:nnsAction={handleAction}
    />
  {:else}
    <ResponsiveTable
      tableData={sortedTableProjects}
      {columns}
      on:nnsAction={handleAction}
      bind:order={$projectsTableOrderStore}
      displayTableSettings
    >
      <svelte:fragment slot="settings-popover">
        <HideZeroNeuronsToggle />
        <Separator spacing="none" />
      </svelte:fragment>

      <div
        slot="last-row"
        class="last-row"
        class:hidden={!shouldHideProjectsWithoutNeurons}
      >
        {#if shouldHideProjectsWithoutNeurons}
          <div class="show-all-button-container">
            {$i18n.staking.hide_no_neurons_table_hint}
            <button
              data-tid="show-all-button"
              class="ghost show-all"
              on:click={showAll}
            >
              {$i18n.staking.show_all}</button
            >
          </div>
        {/if}
      </div>
    </ResponsiveTable>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .top {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--padding-2x);

    @include media.min-width(large) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .last-row {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: row;
    justify-content: right;
    padding: var(--padding-2x);
    gap: var(--padding);
    background: var(--table-row-background);
    border-top: 1px solid var(--elements-divider);

    &.hidden {
      display: none;
    }
  }
  .show-all-button-container {
    color: var(--text-description);
    background: var(--table-row-background);

    button.show-all {
      text-decoration: underline;
    }
  }
</style>
