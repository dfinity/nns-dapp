<script lang="ts">
  import { fade } from "svelte/transition";
  import { busy, busyMessageKey } from "$lib/stores/busy.store";
  import { triggerDebugReport } from "$lib/services/debug.services";
  import { translate } from "$lib/utils/i18n.utils";
  import { Spinner } from "@dfinity/gix-components";
</script>

<!-- Display spinner and lock UI if busyStore is not empty -->
{#if $busy}
  <div data-tid="busy" transition:fade>
    <div class="content">
      {#if $busyMessageKey !== undefined}
        <p>{translate({ labelKey: $busyMessageKey })}</p>
      {/if}
      <span use:triggerDebugReport>
        <Spinner inline />
      </span>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/display";

  div {
    z-index: calc(var(--z-index) + 1000);

    position: fixed;
    @include display.inset;

    background: var(--backdrop);
    color: var(--backdrop-contrast);
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  p {
    padding-bottom: var(--padding);
    max-width: calc(var(--section-max-width) / 2);
  }
</style>
