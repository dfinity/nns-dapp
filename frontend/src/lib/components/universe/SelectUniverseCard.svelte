<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Card } from "@dfinity/gix-components";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";
  import type { SnsSummary } from "$lib/types/sns";
  import ProjectAccountsBalance from "$lib/components/universe/ProjectAccountsBalance.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isSelectedPath } from "$lib/utils/navigation.utils";
  import { nonNullish } from "$lib/utils/utils";

  export let selected: boolean;
  export let role: "link" | "button" | "dropdown" = "link";
  export let summary: SnsSummary | undefined = undefined;

  let theme: "transparent" | "framed" | "highlighted" | undefined =
    "transparent";
  $: theme =
    role === "button" ? "framed" : role === "link" ? "transparent" : undefined;

  let icon: "arrow" | "expand" | "check" | undefined = undefined;
  $: icon =
    role === "button" && selected
      ? "check"
      : role === "dropdown"
      ? "expand"
      : undefined;

  let displayProjectAccountsBalance = false;
  $: displayProjectAccountsBalance = isSelectedPath({
    currentPath: $pageStore.path,
    paths: [AppPath.Accounts, AppPath.Wallet],
  });
</script>

<Card
  role={role === "link" ? "link" : "button"}
  {selected}
  {theme}
  on:click
  {icon}
  testId="select-universe-card"
>
  <div class="container" class:selected>
    <ProjectLogo size="big" {summary} framed={true} />

    <div
      class={`content ${role}`}
      class:balance={displayProjectAccountsBalance}
    >
      <span class="name">{summary?.metadata.name ?? $i18n.core.ic}</span>
      {#if displayProjectAccountsBalance}
        <ProjectAccountsBalance rootCanisterId={summary?.rootCanisterId} />
      {/if}
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/text";

  .container {
    display: flex;
    align-items: center;
    gap: var(--padding-2x);

    &:not(.selected) {
      --logo-framed-background: transparent;
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
