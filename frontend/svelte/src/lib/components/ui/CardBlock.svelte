<script lang="ts">
  import Collapsible from "./Collapsible.svelte";

  export let expandable = false;
  export let limitHeight = true;

  let expanded: boolean = expandable;

  const toggle = ({ detail }: { detail: { expanded: boolean } }) =>
    (expanded = detail.expanded);
</script>

<article data-tid="card-block" class:expanded>
  {#if expandable}
    <Collapsible
      maxContentHeight={300}
      headerAlign="center"
      initiallyExpanded
      on:nnsToggle={toggle}
    >
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
  @use "../../themes/mixins/media.scss";

  article {
    text-decoration: none;

    background: var(--background);
    color: var(--background-contrast);

    padding: var(--padding-1_5x);
    margin: var(--padding-1_5x) 0;
    border-radius: var(--border-radius);

    // TODO: move to variables
    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);

    transition: all var(--animation-time-normal);

    &.expanded {
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }

  h3 {
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    line-height: var(--line-height-standard);
    font-size: var(--font-size-h5);

    @include media.min-width(medium) {
      font-size: var(--font-size-h3);
    }
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
