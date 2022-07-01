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
      <span class="icon">
        <IconInfoOutline />
      </span>
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

    width: 100%;
  }

  dt {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  dd {
    display: flex;
    align-items: center;
    margin-inline-start: 0;
  }
</style>
