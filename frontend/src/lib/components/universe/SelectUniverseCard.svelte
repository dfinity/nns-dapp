<script lang="ts">
  import { Card, Tooltip } from "@dfinity/gix-components";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import UniverseAccountsBalance from "$lib/components/universe/UniverseAccountsBalance.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isSelectedPath } from "$lib/utils/navigation.utils";
  import type { Universe } from "$lib/types/universe";
  import {
    actionableProposalCountStore,
    actionableProposalIndicationEnabledStore,
    actionableProposalSupportedStore,
  } from "$lib/derived/actionable-proposals.derived";
  import ActionableProposalCountBadge from "$lib/components/proposals/ActionableProposalCountBadge.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { onMount } from "svelte";

  export let selected: boolean;
  // "link" for desktop, "button" for mobile, "dropdown" to open the modal
  export let role: "link" | "button" | "dropdown" = "link";
  export let universe: Universe;

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
    $actionableProposalCountStore[universe.canisterId];

  let actionableProposalSupported: boolean | undefined = undefined;
  $: actionableProposalSupported =
    $actionableProposalSupportedStore[universe.canisterId];

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
    <UniverseLogo size="big" {universe} framed={true} />

    <div
      class={`content ${role}`}
      class:balance={displayProjectAccountsBalance}
    >
      <span class="name">
        {universe.title}
        {#if $actionableProposalIndicationEnabledStore}
          {#if nonNullish(actionableProposalCount) && actionableProposalCount > 0 && mounted}
            <ActionableProposalCountBadge
              count={actionableProposalCount}
              {universe}
            />
          {:else if actionableProposalSupported === false}
            <TestIdWrapper testId="not-supported-badge">
              <Tooltip
                id="actionable-not-supported-tooltip"
                text={$i18n.actionable_proposals_not_supported.dot_tooltip}
                top={true}
              >
                <div class="not-supported-badge" />
              </Tooltip>
            </TestIdWrapper>
          {/if}
        {/if}
      </span>
      {#if displayProjectAccountsBalance}
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

  .not-supported-badge {
    // extra gap to align with the count badge
    margin: var(--padding);

    width: var(--padding);
    height: var(--padding);
    border-radius: var(--padding);
    background: var(--background);
  }
</style>
