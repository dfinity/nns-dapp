<script lang="ts">
  // TODO: collapsible -- https://dfinity.atlassian.net/browse/L2-270
  // export let collapsible: boolean = false;
  // export let initiallyExpanded = true;
</script>

<article>
  <h3><slot name="title" /></h3>
  <div class="content">
    <slot />
  </div>
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
  }

  h3 {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0 var(--padding);

    font-size: var(--font-size-h5);

    @include media.min-width(medium) {
      font-size: var(--font-size-h3);
    }
  }

  .content {
    // TODO: change the height source/behaviour -- https://dfinity.atlassian.net/browse/L2-270
    min-height: 30px;
    max-height: 300px;
    overflow-y: auto;
  }
</style>
