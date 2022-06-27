<script lang="ts">
  import IconInfoOutline from "../../icons/IconInfoOutline.svelte";

  export let info: boolean = false;
  export let testId: string | undefined = undefined;
</script>

<dl data-tid={testId}>
  <dt>
    <span>
      <slot name="key" />
    </span>
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
    gap: var(--padding-2x);

    margin: 0;
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
