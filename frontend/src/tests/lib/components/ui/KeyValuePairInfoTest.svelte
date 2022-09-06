<script lang="ts">
  import KeyValuePairInfo from "../../../../lib/components/ui/KeyValuePairInfo.svelte";

  export let key: string;
  export let value: string;
  export let info: string;
</script>

<KeyValuePairInfo testId="key-value-pair-info-test">
  <p slot="key">{key}</p>
  <p slot="value">{value}</p>
  <p slot="info">{info}</p>
</KeyValuePairInfo>
