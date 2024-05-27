<script lang="ts">
  import type { UserTokenData, UserTokenLoading } from "$lib/types/tokens-page";
  import Logo from "../../ui/Logo.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: UserTokenData | UserTokenLoading;
</script>

<div class="title-logo-wrapper">
  <Logo src={rowData.logo} alt={rowData.title} size="medium" framed />
  <div class="title-wrapper">
    <h5 data-tid="project-name">{rowData.title}</h5>
    {#if nonNullish(rowData.subtitle)}
      <span data-tid="project-subtitle" class="description"
        >{rowData.subtitle}</span
      >
    {/if}
  </div>
</div>

<style lang="scss">
  h5 {
    margin: 0;
  }

  .title-logo-wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);

    .title-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
    }
  }
</style>
