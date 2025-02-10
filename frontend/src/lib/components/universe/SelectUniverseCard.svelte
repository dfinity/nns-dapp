<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableProposalCountBadge from "$lib/components/proposals/ActionableProposalCountBadge.svelte";
  import ActionableProposalTotalCountBadge from "$lib/components/proposals/ActionableProposalTotalCountBadge.svelte";
  import UniverseAccountsBalance from "$lib/components/universe/UniverseAccountsBalance.svelte";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import {
    actionableProposalCountStore,
    actionableProposalIndicationVisibleStore,
    actionableProposalTotalCountStore,
  } from "$lib/derived/actionable-proposals.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { Universe } from "$lib/types/universe";
  import { isSelectedPath } from "$lib/utils/navigation.utils";
  import { Card, testSafeScale } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";
  import { cubicOut } from "svelte/easing";

  export let selected: boolean;
  // "link" for desktop, "button" for mobile, "dropdown" to open the modal
  export let role: "link" | "button" | "dropdown" = "link";
  export let universe: Universe | "all-actionable";

  let icon: "expand" | "check" | undefined = undefined;
  $: icon = role === "dropdown" ? "expand" : undefined;

  let displayProjectAccountsBalance = false;
  $: displayProjectAccountsBalance =
    $authSignedInStore &&
    isSelectedPath({
      currentPath: $pageStore.path,
      paths: [AppPath.Accounts, AppPath.Wallet],
    });

  let actionableProposalCount: number | undefined = undefined;
  $: actionableProposalCount =
    universe === "all-actionable"
      ? undefined
      : $actionableProposalCountStore[universe.canisterId];

  // Always rerender to trigger animation start
  let mounted = false;
  onMount(() => (mounted = true));
</script>

<Card
  role="button"
  {selected}
  theme="transparent"
  on:click
  {icon}
  testId="select-universe-card"
  noPadding
  noMargin
>
  <div class="container" class:selected>
    <UniverseLogo size="medium" {universe} framed={true} />

    <div
      class={`content ${role}`}
      class:balance={displayProjectAccountsBalance &&
        universe !== "all-actionable"}
    >
      <span class="name">
        {#if universe === "all-actionable"}
          <TestIdWrapper testId="universe-name"
            >{$i18n.voting.actionable_proposals}</TestIdWrapper
          >
          {#if $actionableProposalIndicationVisibleStore}
            {#if $actionableProposalTotalCountStore > 0 && mounted}
              <div
                in:testSafeScale={{
                  duration: 250,
                  easing: cubicOut,
                }}
              >
                <ActionableProposalTotalCountBadge />
              </div>
            {/if}
          {/if}
        {:else}
          <TestIdWrapper testId="universe-name">{universe.title}</TestIdWrapper>
          {#if $actionableProposalIndicationVisibleStore}
            {#if nonNullish(actionableProposalCount) && actionableProposalCount > 0 && mounted}
              <ActionableProposalCountBadge
                count={actionableProposalCount}
                {universe}
              />
            {/if}
          {/if}
        {/if}
      </span>
      {#if displayProjectAccountsBalance && universe !== "all-actionable"}
        <UniverseAccountsBalance {universe} />
      {/if}
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .container {
    display: flex;
    align-items: center;
    gap: var(--padding-2x);
    // Same as Card padding
    // We want to padding in the container to use the hover effect on ALL the card surface.
    padding: calc(var(--padding-2x) - var(--card-border-size));

    --value-color: var(--text-color);

    &:not(.selected) {
      --logo-framed-background: transparent;
    }

    &:hover,
    &:focus,
    &.selected {
      --logo-framed-background: var(--input-border-color);
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;

    &.dropdown,
    &.balance {
      padding: var(--padding-0_5x) 0 0;
    }

    &.balance {
      gap: var(--padding-0_5x);
    }
  }

  .name {
    @include fonts.standard(true);
    @include text.clamp(2);

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--padding);
  }
</style>
