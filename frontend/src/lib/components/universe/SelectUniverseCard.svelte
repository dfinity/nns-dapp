<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Card } from "@dfinity/gix-components";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import ProjectAccountsBalance from "$lib/components/universe/ProjectAccountsBalance.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isSelectedPath } from "$lib/utils/navigation.utils";
  import type { Universe } from "$lib/types/universe";
  import { isNullish } from "$lib/utils/utils";
  import { isUniverseCkBTC } from "$lib/utils/universe.utils";

  export let selected: boolean;
  export let role: "link" | "button" | "dropdown" = "link";
  export let universe: Universe;

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

  let ckBTC = false;
  $: ckBTC = isUniverseCkBTC(universe.canisterId);
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
    <UniverseLogo size="big" {universe} framed={true} />

    <div
      class={`content ${role}`}
      class:balance={displayProjectAccountsBalance}
    >
      <span class="name"
        >{universe.summary?.metadata.name ??
          (ckBTC ? $i18n.ckbtc.title : $i18n.core.ic)}</span
      >
      {#if displayProjectAccountsBalance}
        <ProjectAccountsBalance
          rootCanisterId={universe.summary?.rootCanisterId}
        />
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

    --value-color: var(--text-color);

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
