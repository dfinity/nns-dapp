<script lang="ts">
  import KeyValuePairInfo from "$lib/gix/components/KeyValuePairInfo.svelte";

  interface Props {
    key: string;
    value: string;
    info: string;
  }

  let { key: keyStr, value: valueStr, info: infoStr }: Props = $props();
</script>

<KeyValuePairInfo testId="key-value-pair-info-test">
  {#snippet key()}{keyStr}{/snippet}
  {#snippet value()}{valueStr}{/snippet}
  {#snippet info()}{infoStr}{/snippet}
</KeyValuePairInfo>
