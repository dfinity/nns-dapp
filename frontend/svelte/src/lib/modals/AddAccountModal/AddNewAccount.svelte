<script lang="ts">
  import Input from "../../components/ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";
  import { createSubAccount } from "../../services/accounts.services";
  import Spinner from "../../components/ui/Spinner.svelte";
  import {
    NameTooLongError,
    SubAccountLimitExceededError,
  } from "../../canisters/nns-dapp/nns-dapp.errors";
  import { toastsStore } from "../../stores/toasts.store";
  import { errorToString } from "../../utils/error.utils";

  let newAccountName: string = "";

  let dispatcher = createEventDispatcher();
  let creating: boolean = false;
  const createNewAccount = async () => {
    try {
      creating = true;
      await createSubAccount(newAccountName);
      dispatcher("nnsClose");
    } catch (err) {
      let labelKey = "create_subaccount";
      if (err instanceof NameTooLongError) {
        labelKey = "create_subaccount_too_long";
      }
      if (err instanceof SubAccountLimitExceededError) {
        labelKey = "create_subaccount_limit_exceeded";
      }
      toastsStore.show({
        labelKey,
        level: "error",
        detail: errorToString(err),
      });
      console.error(err);
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
