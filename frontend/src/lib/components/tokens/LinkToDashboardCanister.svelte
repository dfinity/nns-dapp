<script lang="ts">
  import { IconOpenInNew } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { isNullish } from "@dfinity/utils";

  export let canisterId: Principal;
  export let label: string | undefined = undefined;
  export let testId: string | undefined = "link-to-dashboard-canister-component";

  let href: string;
  $: href = replacePlaceholders($i18n.import_token.link_to_dashboard, {
    $canisterId: canisterId.toText(),
  });

  let noLabel = true;
  $: noLabel = isNullish(label);
</script>

<a
  class="button ghost with-icon"
  class:noLabel
  data-tid={testId}
  {href}
  target="_blank"
  rel="noopener noreferrer"
>
  <IconOpenInNew />
  {#if !noLabel}
    <TestIdWrapper testId="label">{label}</TestIdWrapper>
  {/if}
</a>

<style lang="scss">
  a {
    &.button.with-icon {
      // Overwrite a.button.with-icon alignment.
      justify-content: start;
    }

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
