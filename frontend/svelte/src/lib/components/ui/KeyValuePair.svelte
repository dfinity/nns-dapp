<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<dl data-tid={testId}>
  <dt>
    <span>
      <slot name="key" />
    </span>
  </dt>
  <dd>
    <slot name="value" />
  </dd>
</dl>

<style lang="scss">
  dl {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--padding-2x);

    margin: 0;

    width: 100%;
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
