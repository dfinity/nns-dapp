<!-- adapted source: https://github.com/ionic-team/ionic-framework/tree/main/core/src/components/skeleton-text -->
<script lang="ts">
  export let animated: boolean = true;
</script>

<p class:animated data-tid="skeleton-paragraph" aria-busy="true">
  <span>&nbsp;</span>
</p>

<style lang="scss">
  p {
    display: block;

    width: 100%;
    height: inherit;

    margin: var(--padding-0_5x) 0;

    --skeleton-text-background: rgba(var(--light-background-rgb), 0.065);
    --skeleton-text-background-animated: rgba(
      var(--light-background-rgb),
      0.135
    );
    background: var(--skeleton-text-background);

    line-height: var(--skeleton-text-line-height, 0.8);

    user-select: none;
    pointer-events: none;
  }

  span {
    display: inline-block;
  }

  .animated {
    position: relative;

    background: linear-gradient(
      to right,
      var(--skeleton-text-background) 8%,
      var(--skeleton-text-background-animated) 18%,
      var(--skeleton-text-background) 33%
    );
    background-size: 800px 104px;
    animation-duration: 1s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: skeleton-text-shimmer;
    animation-timing-function: linear;
  }

  /* -global- */
  @keyframes -global-skeleton-text-shimmer {
    0% {
      background-position: -400px 0;
    }

    100% {
      background-position: 400px 0;
    }
  }
</style>
