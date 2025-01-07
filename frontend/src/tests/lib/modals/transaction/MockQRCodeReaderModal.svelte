<script lang="ts">
  import { createEventDispatcher } from "svelte";

  let value = "";

  const dispatch = createEventDispatcher();

  const handleInput = (event: Event) => {
    value = (event.target as HTMLInputElement).value;
  };

  const handleClick = () => {
    dispatch("nnsQRCode", value);
  };
</script>

<input type="text" data-tid="mock-qr-input" on:input={handleInput} />
<button data-tid="mock-qr-dispatch" on:click={handleClick}>Send</button>
