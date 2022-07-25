<script lang="ts">
  import KeyValuePair from "../../../../lib/components/ui/KeyValuePair.svelte";

  export let key: string;
  export let value: string;
</script>

<KeyValuePair>
  <p slot="key">{key}</p>
  <p slot="value">{value}</p>
</KeyValuePair>
