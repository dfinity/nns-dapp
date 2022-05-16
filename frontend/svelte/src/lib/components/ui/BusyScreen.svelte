<script lang="ts">
  import { fade } from "svelte/transition";
  import { busy, busyMessageKey } from "../../stores/busy.store";
  import { translate } from "../../utils/i18n.utils";
  import Spinner from "./Spinner.svelte";
</script>

<!-- Display spinner and lock UI if busyStore is not empty -->
{#if $busy}
  <div data-tid="busy" transition:fade>
    <div class="content">
      {#if $busyMessageKey !== undefined}
        <h4>{translate({ labelKey: $busyMessageKey })}</h4>
      {/if}
      <span>
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

    background-color: rgba(var(--background-rgb), 0.75);
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
