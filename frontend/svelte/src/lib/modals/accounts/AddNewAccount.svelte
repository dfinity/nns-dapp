<script lang="ts">
  import Input from "../../components/ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";
  import { addSubAccount } from "../../services/accounts.services";
  import Spinner from "../../components/ui/Spinner.svelte";
  import {
    NameTooLongError,
    SubAccountLimitExceededError,
  } from "../../canisters/nns-dapp/nns-dapp.errors";
  import { toastsStore } from "../../stores/toasts.store";

  let newAccountName: string = "";

  let dispatcher = createEventDispatcher();
  let creating: boolean = false;
  const createNewAccount = async () => {
    try {
      creating = true;
      await addSubAccount({
        name: newAccountName,
      });
      dispatcher("nnsClose");
    } catch (err) {
      const labelKey =
        err instanceof NameTooLongError
          ? "create_subaccount_too_long"
          : err instanceof SubAccountLimitExceededError
          ? "create_subaccount_limit_exceeded"
          : "create_subaccount";
      toastsStore.error({
        labelKey,
        err,
      });
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
      disabled={newAccountName.length === 0 || creating}
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
