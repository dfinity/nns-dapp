<script lang="ts">
  import Collapsible from "./Collapsible.svelte";

  export let expandable = false;
  export let limitHeight = true;

  let expanded: boolean = expandable;

  const toggle = ({ detail }: { detail: { expanded: boolean } }) =>
    (expanded = detail.expanded);
</script>

<article data-tid="card-block" class="card" class:expanded>
  {#if expandable}
    <Collapsible maxContentHeight={300} initiallyExpanded on:nnsToggle={toggle}>
      <h3 slot="header"><slot name="title" /></h3>
      <div class="content">
        <slot />
      </div>
    </Collapsible>
  {:else}
    <h3><slot name="title" /></h3>
    <div class="content" class:limit-height={limitHeight}>
      <slot />
    </div>
  {/if}
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/media";

  article {
    text-decoration: none;

    background: var(--card-background);
    box-shadow: var(--box-shadow);

    padding: var(--padding-2x);

    border-radius: var(--border-radius);

    transition: all var(--animation-time-normal);
  }

  h3 {
    // increase click area
    margin: calc(-1 * var(--padding));
    padding: var(--padding);
  }

  .content {
    margin: var(--padding-2x) 0 var(--padding);
    overflow-x: auto;

    &.limit-height {
      max-height: 300px;
      overflow-y: auto;
    }
  }
</style>
