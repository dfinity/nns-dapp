<script lang="ts">
  import IconInfoOutline from "../../icons/IconInfoOutline.svelte";

  export let info: boolean = false;
</script>

<dl>
  <dt>
    <slot name="key" />
    {#if info}
      <IconInfoOutline />
    {/if}
  </dt>
  <dd>
    <slot name="value" />
  </dd>
</dl>

<style lang="scss">
  dl {
    display: flex;
    justify-content: space-between;
  }

  dt {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  dd {
    display: flex;
    align-items: center;
    margin-inline-start: 0;
  }
</style>
