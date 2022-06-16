<script lang="ts">
  import type { Proposal } from "@dfinity/nns";
  import CardBlock from "../../ui/CardBlock.svelte";
  import {
    proposalFirstActionKey,
    proposalActionFields,
  } from "../../../../lib/utils/proposals.utils";
  import Json from "../../common/Json.svelte";

  export let proposal: Proposal | undefined;

  let actionKey: string | undefined;
  let actionFields: [string, unknown][] = [];
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionFields =
    (proposal !== undefined && proposalActionFields(proposal)) || [];
</script>

<CardBlock limitHeight={false}>
  <svelte:fragment slot="title">{actionKey}</svelte:fragment>
  <dl>
    {#each actionFields as [key, value]}
      <dt>{key}</dt>
      {#if typeof value === "object"}
        <dd><Json json={value} /></dd>
      {:else}
        <dd>{value}</dd>
      {/if}
    {/each}
  </dl>
</CardBlock>

<style lang="scss">
  @use "../../../themes/mixins/media";

  dl {
    margin: 0;

    dt {
      font-size: var(--font-size-ultra-small);
      color: var(--background-contrast);
      line-height: 1;
      margin: 0 0 var(--padding-0_5x);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
    dd {
      margin: 0 0 var(--padding);
      &:last-child {
        margin: 0;
      }

      font-size: var(--font-size-ultra-small);
      color: var(--gray-200);
      overflow-wrap: break-word;
      white-space: pre-wrap;

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }
</style>
