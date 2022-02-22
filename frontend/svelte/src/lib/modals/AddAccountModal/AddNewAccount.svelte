<script lang="ts">
  import Input from "../../components/ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { accountsStore } from "../../stores/accounts.store";
  import { createEventDispatcher } from "svelte";
  import { createSubAccount } from "../../services/accounts.services";
  import Spinner from "../../components/ui/Spinner.svelte";

  let newAccountName: string = "";

  let dispatcher = createEventDispatcher();
  let creating: boolean = false;
  const createNewAccount = async () => {
    try {
      console.log("before da create");
      creating = true;
      await createSubAccount(newAccountName);
      console.log("after da create");
      dispatcher("nnsClose");
    } catch (error) {
      // TODO: Manage errors
      console.error("Error creating subAccount");
      console.error(error);
    } finally {
      creating = false;
    }
  };
</script>

<section>
  <form on:submit|preventDefault={createNewAccount}>
    <div>
      <h4 class="balance">{$i18n.accounts.new_linked_account_title}</h4>
      <Input
        inputType="text"
        placeholderLabelKey="accounts.new_linked_account_placeholder"
        name="newAccount"
        bind:value={newAccountName}
        theme="dark"
      />
    </div>
    <button
      class="primary full-width"
      type="submit"
      disabled={!newAccountName || creating}
    >
      {#if creating}
        <Spinner />
      {:else}
        {$i18n.core.create}
      {/if}
    </button>
  </form>
</section>

<style lang="scss">
  section {
    padding: calc(2 * var(--padding));

    box-sizing: border-box;
    height: 100%;
  }

  form {
    height: 100%;
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;

    --input-width: 100%;

    div {
      padding: 0 calc(2 * var(--padding));
      // push button to the bottom
      flex-grow: 1;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
</style>
