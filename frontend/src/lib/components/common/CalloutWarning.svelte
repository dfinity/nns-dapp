<script lang="ts">
  import { Html, IconError } from "@dfinity/gix-components";

  export let htmlText: string;
</script>

<article data-tid="callout-warning-component">
  <span class="icon"><IconError size="24" /></span>
  <p data-tid="text"><Html text={htmlText} /></p>
</article>

<style lang="scss">
  article {
    display: flex;
    align-items: center;
    gap: var(--padding-1_5x);
    padding: var(--padding) var(--padding-1_5x);
    border-radius: var(--border-radius);
    background-color: var(--tooltip-background);
    color: var(--tooltip-text-color);
  }

  .icon {
    padding: var(--padding-0_5x);
    color: var(--alert);
  }

  p {
    margin: 0;
  }
</style>
