<script lang="ts">
  import { Card } from "@dfinity/gix-components";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import UniverseAccountsBalance from "$lib/components/universe/UniverseAccountsBalance.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isSelectedPath } from "$lib/utils/navigation.utils";
  import type { Universe } from "$lib/types/universe";

  export let selected: boolean;
  export let role: "link" | "button" | "dropdown" = "link";
  export let universe: Universe;

  let theme: "transparent" | "framed" | "highlighted" | undefined =
    "transparent";
  $: theme =
    role === "button" ? "framed" : role === "link" ? "transparent" : undefined;

  let icon: "expand" | "check" | undefined = undefined;
  $: icon =
    role === "button" && selected
      ? "check"
      : role === "dropdown"
      ? "expand"
      : undefined;

  let displayProjectAccountsBalance = false;
  $: displayProjectAccountsBalance =
    $authSignedInStore &&
    isSelectedPath({
      currentPath: $pageStore.path,
      paths: [AppPath.Accounts, AppPath.Wallet],
    });
</script>

<Card
  role="button"
  {selected}
  {theme}
  on:click
  {icon}
  testId="select-universe-card"
  noPadding
>
  <div class="container" class:selected>
    <UniverseLogo size="big" {universe} framed={true} />

    <div
      class={`content ${role}`}
      class:balance={displayProjectAccountsBalance}
    >
      <span class="name">{universe.title}</span>
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
  }
</style>
