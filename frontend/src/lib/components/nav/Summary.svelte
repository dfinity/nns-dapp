<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import { INTERNET_COMPUTER, IC_LOGO } from "$lib/constants/icp.constants";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import SelectProjectDropdownHeader from "$lib/components/nav/SelectProjectDropdownHeader.svelte";

  export let logo = IC_LOGO;
  export let title = INTERNET_COMPUTER;
</script>

<div class="summary" data-tid="accounts-summary">
  <Logo src={logo} alt="" size="big" framed={false} testId="accounts-logo" />

  {#if ENABLE_SNS}
    <SelectProjectDropdownHeader />
  {:else}
    <h1 data-tid="accounts-title">{title}</h1>
  {/if}

  <div class="details" class:sns={ENABLE_SNS}>
    <slot name="details" />
  </div>
</div>

<style lang="scss">
  @use "../../../../node_modules/@dfinity/gix-components/styles/mixins/media";
  @use "../../../../node_modules/@dfinity/gix-components/styles/mixins/text";

  .summary {
    display: grid;
    grid-template-columns: repeat(2, auto);

    margin: var(--padding) 0 var(--padding-3x);
    --amount-color: var(--content-color);

    column-gap: var(--padding-2x);

    width: fit-content;
    max-width: 100%;

    word-break: break-all;

    :global(img) {
      grid-row-start: 1;
      grid-row-end: 3;
    }
  }

  .details {
    &.sns {
      margin-left: var(--padding-2x);
    }
  }

  h1 {
    display: inline-block;
    @include text.truncate;
  }
</style>
