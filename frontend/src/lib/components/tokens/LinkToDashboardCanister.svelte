<script lang="ts">
  import { IconOpenInNew } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let canisterId: Principal;
  export let noLabel: boolean = false;

  let href: string;
  $: href = replacePlaceholders($i18n.import_token.link_to_dashboard, {
    $canisterId: canisterId.toText(),
  });
</script>

<a
  class="button ghost with-icon"
  class:noLabel
  data-tid="link-to-dashboard-canister-component"
  {href}
  target="_blank"
  rel="noopener noreferrer"
>
  <IconOpenInNew />
  {#if !noLabel}
    <TestIdWrapper testId="label"
      >{$i18n.import_token.view_in_dashboard}</TestIdWrapper
    >
  {/if}
</a>

<style lang="scss">
  a {
    &:hover {
      text-decoration: underline;
    }

    &.noLabel {
      // Increase click area
      padding: var(--padding-0_5x);

      &:hover {
        color: inherit;
      }
    }
  }
</style>
