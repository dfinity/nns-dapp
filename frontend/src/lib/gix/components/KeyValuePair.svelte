<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    testId?: string;
    key: Snippet;
    value: Snippet;
  }

  let { testId, key, value }: Props = $props();
</script>

<dl data-tid={testId}>
  <dt>
    <span>
      {@render key()}
    </span>
  </dt>
  <dd>
    {@render value()}
  </dd>
</dl>

<style lang="scss">
  dl {
    display: flex;
    justify-content: var(--key-value-pair-justify-content, space-between);
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
    text-align: right;
  }
</style>
