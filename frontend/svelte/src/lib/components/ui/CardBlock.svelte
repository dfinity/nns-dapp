<script lang="ts">
  import Collapsible from "./Collapsible.svelte";

  export let expandable = false;

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
    <div class="content limit-height">
      <slot />
    </div>
  {/if}
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/media.scss";

  article {
    text-decoration: none;

    background: var(--gray-100-background);
    color: var(--gray-100-background-contrast);

    padding: calc(1.5 * var(--padding));
    margin: calc(1.5 * var(--padding)) 0;
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
    margin: calc(2 * var(--padding)) 0 var(--padding);

    &.limit-height {
      max-height: 300px;
      overflow-y: auto;
    }
  }
</style>
