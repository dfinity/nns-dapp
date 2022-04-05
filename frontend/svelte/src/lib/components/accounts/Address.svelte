<script lang="ts">
  import Input from "../ui/Input.svelte";
  import { i18n } from "../../stores/i18n";

  export let address: number | undefined;

  // TODO(L2-430): to be implemented
  const submitAddress = () => console.log("submitAddress");

  // TODO(L2-430): Input is of type number?
  // TODO(L2-430): Input validation rules - max 40 characters?
  // TODO(L2-430): tests
</script>

<article>
  <form on:submit|preventDefault={submitAddress}>
    <Input
      inputType="number"
      placeholderLabelKey="accounts.address"
      name="transaction-address"
      bind:value={address}
      theme="dark"
    />
    <button
      class="primary small"
      type="submit"
      disabled={address === undefined || address === 0}
    >
      {$i18n.core.continue}
    </button>
  </form>
</article>

<style lang="scss">
  article {
    margin-bottom: calc(2 * var(--padding));
    padding: 0 0 calc(2 * var(--padding));
  }

  form {
    display: flex;
    flex-direction: column;
  }
</style>
