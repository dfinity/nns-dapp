<script lang="ts">
  import IconExpandMore from "../../icons/IconExpandMore.svelte";

  let isExpanded: boolean = false;

  const toggleContent = () => (isExpanded = !isExpanded);
</script>

<article>
  <div class="wrapper">
    <div class="info">
      <h3>All Topics Except Governance</h3>
      <p>Follow neurons on all proposal topics except the governance topic.</p>
    </div>
    <div class="toolbar">
      <h3 class="badge">0</h3>
      <span class:isExpanded on:click={toggleContent}><IconExpandMore /></span>
    </div>
  </div>
  <div class="content" class:isExpanded>
    <h4>Currently Following</h4>
    <!-- TODO: Iterate followees -->
    <div class="button-wrapper">
      <button class="secondary small">Add Followee</button>
    </div>
  </div>
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  .wrapper {
    display: flex;
    align-items: start;
    justify-content: space-around;
    gap: calc(2 * var(--padding));
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: calc(2 * var(--padding));
    margin-top: calc(2 * var(--padding));
  }

  .badge {
    background-color: var(--background-contrast);
    color: var(--background);
    border-radius: 50%;
    padding: var(--padding);
    width: calc(2 * var(--padding));
    height: calc(2 * var(--padding));
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar span {
    @include interaction.tappable;

    color: var(--black);

    transition: transform 0.3s;

    &.isExpanded {
      transform: rotate(180deg);
    }
  }

  .content {
    max-height: 0;
    height: fit-content;
    overflow: hidden;
    transition: max-height 0.3s;

    background: var(--black);

    &.isExpanded {
      max-height: calc(300px);
      height: fit-content;
    }

    h4 {
      padding: var(--padding);
    }

    .button-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--padding) 0;
    }
  }
</style>
