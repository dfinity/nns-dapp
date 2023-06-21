<script lang="ts">
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let loading = false;
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<CardInfo>
  <h3 slot="start">Proposals TESTNET ONLY</h3>

  <div>
    <button
      on:click
      class={`primary ${loading ? "icon-only" : ""}`}
      disabled={loading}
      data-tid="make-dummy-proposals-button"
    >
      {#if loading}
        <Spinner inline size="small" />
      {:else}
        Make Dummy Proposals
      {/if}
    </button>
  </div>
</CardInfo>

<Separator />

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  div {
    display: flex;
    justify-content: flex-start;
  }
</style>
