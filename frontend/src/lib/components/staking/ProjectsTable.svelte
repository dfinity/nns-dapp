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
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { tokensListVisitorsStore } from "$lib/derived/tokens-list-visitors.derived";
  import {
    loadAccountsBalances,
    loadSnsAccountsBalances,
  } from "$lib/services/accounts-balances.services";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { failedActionableSnsesStore } from "$lib/stores/actionable-sns-proposals.store";
  import {
    ENABLE_APY_PORTFOLIO,
    ENABLE_NEW_TABLES,
  } from "$lib/stores/feature-flags.store";
  import { hideZeroNeuronsStore } from "$lib/stores/hide-zero-neurons.store";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { projectsTableOrderStore } from "$lib/stores/projects-table.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import { stakingRewardsStore } from "$lib/stores/staking-rewards.store";
  import type { ProjectsTableColumn, TableProject } from "$lib/types/staking";
  import { isStakingRewardDataReady } from "$lib/utils/staking-rewards.utils";
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
  import { createEventDispatcher } from "svelte";

  $: if ($authSignedInStore) {
    loadIcpSwapTickers();
  }
  let commonColumns: ProjectsTableColumn[] = [];
  $: commonColumns = [
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
  ];

  let columns: ProjectsTableColumn[] = [];
  $: columns = [
    {
      id: "title",
      title: $i18n.staking.nervous_systems,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["2fr"],
      comparator: $authSignedInStore ? compareByProject : undefined,
    },
    ...commonColumns,
  ];

  let nnsColumns: ProjectsTableColumn[] = [];
  $: nnsColumns = [
    {
      id: "title",
      title: $i18n.staking.nervous_systems_nns,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["2fr"],
      comparator: $authSignedInStore ? compareByProject : undefined,
    },
    ...commonColumns,
  ];

  let snsColumns: ProjectsTableColumn[] = [];
  $: snsColumns = [
    {
      id: "title",
      title: $i18n.staking.nervous_systems_sns,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["2fr"],
      comparator: $authSignedInStore ? compareByProject : undefined,
    },
    ...commonColumns,
  ];

  let sunsettedSnsColumns: ProjectsTableColumn[] = [];
  $: sunsettedSnsColumns = [
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
  ];

  let tableProjects: undefined | TableProject[];
  $: tableProjects = getTableProjects({
    universes: $selectableUniversesStore,
    isSignedIn: $authSignedInStore,
    nnsNeurons: $neuronsStore?.neurons,
    snsNeurons: $snsNeuronsStore,
    icpSwapUsdPrices: $icpSwapUsdPricesStore,
    failedActionableSnses: $failedActionableSnsesStore,
  });

  let shouldHideProjectsWithoutNeurons: boolean;
  $: shouldHideProjectsWithoutNeurons =
    $authSignedInStore && $hideZeroNeuronsStore === "hide";

  let visibleTableProjects: TableProject[] = [];
  $: visibleTableProjects = shouldHideProjectsWithoutNeurons
    ? tableProjects.filter(
        ({ neuronCount = 0, universeId }) =>
          universeId === OWN_CANISTER_ID_TEXT || neuronCount > 0
      )
    : tableProjects;

  let sortedTableProjects: TableProject[];
  $: sortedTableProjects = sortTableProjects(visibleTableProjects);

  let hasAnyNeurons: boolean;
  $: hasAnyNeurons = tableProjects.some(
    (project) => project.neuronCount ?? 0 > 0
  );

  let totalStakeInUsd: number;
  $: totalStakeInUsd = getTotalStakeInUsd(tableProjects);

  let hasUnpricedTokens: boolean;
  $: hasUnpricedTokens = tableProjects.some(
    (project) =>
      project.stake instanceof TokenAmountV2 &&
      project.stake.toUlps() > 0n &&
      (!("stakeInUsd" in project) || isNullish(project.stakeInUsd))
  );

  let nnsNeurons: TableProject[] = [];
  $: nnsNeurons = sortedTableProjects.filter(
    (project) => project.universeId === OWN_CANISTER_ID_TEXT
  );

  let snsNeurons: TableProject[] = [];
  $: snsNeurons = sortedTableProjects
    .filter((p) => p.universeId !== OWN_CANISTER_ID_TEXT)
    .filter((p) => !abandonedProjectsCanisterId.includes(p.universeId));

  let sunsetSns: TableProject[] = [];
  $: sunsetSns = sortedTableProjects.filter((p) =>
    abandonedProjectsCanisterId.includes(p.universeId)
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

  // ==================================
  // Staking Rewards/APY related logic
  // ==================================
  let totalUsdAmount: number | undefined;
  $: totalUsdAmount =
    $ENABLE_APY_PORTFOLIO && $authSignedInStore
      ? getTotalBalanceInUsd($tokensListVisitorsStore) +
        getTotalStakeInUsd(tableProjects)
      : undefined;

  // load ckBTC
  $: if ($ENABLE_APY_PORTFOLIO && $authSignedInStore) {
    const ckBTCUniverseIds = $ckBTCUniversesStore.map(
      (universe) => universe.canisterId
    );
    loadAccountsBalances(ckBTCUniverseIds);
  }

  // load other ck and imported tokens
  $: if ($ENABLE_APY_PORTFOLIO && $authSignedInStore) {
    const icrcUniverseIds = Object.keys($icrcCanistersStore);
    loadAccountsBalances(icrcUniverseIds);
  }

  $: if ($ENABLE_APY_PORTFOLIO && $authSignedInStore) {
    const snsRootCanisterIds = $snsProjectsCommittedStore.map(
      ({ rootCanisterId }) => rootCanisterId
    );
    loadSnsAccountsBalances(snsRootCanisterIds);
  }

  let usdValueBannerVisible: boolean;
  $: usdValueBannerVisible = hasAnyNeurons;
  let apyCardVisible: boolean;
  $: apyCardVisible = $ENABLE_APY_PORTFOLIO && nonNullish(totalUsdAmount);
</script>

<div class="wrapper" data-tid="projects-table-component">
  <div class="top" class:two-card={usdValueBannerVisible && apyCardVisible}>
    {#if $authSignedInStore}
      {#if usdValueBannerVisible}
        <UsdValueBanner usdAmount={totalStakeInUsd} {hasUnpricedTokens}>
          <IconNeuronsPage slot="icon" />
        </UsdValueBanner>
      {/if}

      {#if apyCardVisible}
        {#if nonNullish(totalUsdAmount)}
          {#if isStakingRewardDataReady($stakingRewardsStore)}
            <ApyCard
              onStakingPage={true}
              rewardBalanceUSD={$stakingRewardsStore.rewardBalanceUSD}
              rewardEstimateWeekUSD={$stakingRewardsStore.rewardEstimateWeekUSD}
              stakingPower={$stakingRewardsStore.stakingPower}
              stakingPowerUSD={$stakingRewardsStore.stakingPowerUSD}
              totalAmountUSD={totalUsdAmount}
            />
          {:else}
            <ApyFallbackCard stakingRewardData={$stakingRewardsStore} />
          {/if}
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
                onclick={showAll}
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
              onclick={showAll}
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

    @include media.min-width(large) {
      column-gap: var(--padding-2x);
      row-gap: var(--padding-3x);
    }
  }

  .top {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--padding-2x);

    &.two-card {
      @include media.min-width(large) {
        grid-template-columns: 1fr 1fr;
      }
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
