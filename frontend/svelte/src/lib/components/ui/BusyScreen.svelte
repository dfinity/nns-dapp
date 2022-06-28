<script lang="ts">
  import { fade } from "svelte/transition";
  import { busy, busyMessageKey } from "../../stores/busy.store";
  import { triggerDebugReport } from "../../utils/dev.utils";
  import { translate } from "../../utils/i18n.utils";
  import Spinner from "./Spinner.svelte";
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
  div {
    z-index: calc(var(--z-index) + 1000);

    position: fixed;
    inset: 0;

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
