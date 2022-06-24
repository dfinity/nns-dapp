<script lang="ts">
  import KeyValuePair from "../../../../lib/components/ui/KeyValuePair.svelte";

  export let key: string;
  export let value: string;
  export let info: boolean = false;
</script>

<KeyValuePair {info}>
  <p slot="key">{key}</p>
  <p slot="value">{value}</p>
</KeyValuePair>
