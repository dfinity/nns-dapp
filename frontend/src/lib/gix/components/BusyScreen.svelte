<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { fade } from "svelte/transition";
  import Spinner from "$lib/gix/components/Spinner.svelte";
  import { busy, busyMessage } from "$lib/gix/stores/busy.store";
</script>

<!-- Display spinner and lock UI if busyStore is not empty -->
{#if $busy}
  <div data-tid="busy" transition:fade|global>
    <div class="content">
      {#if nonNullish($busyMessage)}
        <p>{$busyMessage}</p>
      {/if}
      <span>
        <Spinner inline />
      </span>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../styles/mixins/display";

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
