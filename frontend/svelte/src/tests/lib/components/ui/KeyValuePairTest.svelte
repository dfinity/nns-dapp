<script lang="ts">
  import KeyValuePair from "../../../../lib/components/ui/KeyValuePair.svelte";

  export let key: string;
  export let value: string;
  export let info: boolean = false;
  export let infoText: string | undefined = undefined;
</script>

<KeyValuePair {info}>
  <p slot="key">{key}</p>
  <p slot="value">{value}</p>
  {#if infoText !== undefined}
    <p>{infoText}</p>
  {/if}
</KeyValuePair>
