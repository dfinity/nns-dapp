<script lang="ts">
  import Input from "../../../../lib/components/ui/Input.svelte";

  export let props = {};

  let amount: number;
</script>

<span id="test">{amount}</span>

<Input bind:value={amount} {...props} />
