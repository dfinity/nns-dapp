<script lang="ts">
  import IconInfo from "../../icons/IconInfo.svelte";

  export let info: boolean = false;
</script>

<div>
  <span>
    <slot name="key" />
    {#if info}
      <!-- TODO: Current IconInfo does not match current design. Change it IconInfo or design? -->
      <IconInfo />
    {/if}
  </span>
  <slot name="value" />
  <!-- TODO: https://dfinity.atlassian.net/browse/L2-735 show <slot /> when info clicked -->
  <div class="info">
    <slot />
  </div>
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;
  }

  span {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .info {
    display: none;
  }
</style>
