<script lang="ts">
  import Json from "../common/Json.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";

  export let actionKey: string | undefined;
  export let actionFields: [string, unknown][] = [];
</script>

<div class="content-cell-island">
  <h2
    class="content-cell-title"
    data-tid="proposal-proposer-actions-entry-title"
  >
    {actionKey ?? ""}
  </h2>

  <div class="content-cell-details">
    {#each actionFields as [key, value]}
      <KeyValuePair>
        <span slot="key">{key}</span>
        <span class="value" slot="value">
          {#if typeof value === "object"}
            <Json json={value} />
          {:else}
            {value}
          {/if}
        </span>
      </KeyValuePair>
    {/each}
  </div>
</div>

<style lang="scss">
  .content-cell-island {
    margin-top: var(--row-gap);
  }

  .content-cell-details {
    overflow-x: auto;
    // get rid of vertical scroll
    padding-bottom: 1px;
  }
</style>
