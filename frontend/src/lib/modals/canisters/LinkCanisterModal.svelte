<script lang="ts">
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import { attachCanister } from "$lib/services/canisters.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import { errorCanisterNameMessage } from "$lib/utils/canisters.utils";
  import { Modal, busy } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  let principal: Principal | undefined;
  let name = "";
  let errorMessage: string | undefined = undefined;
  $: errorMessage = errorCanisterNameMessage(name);

  const dispatcher = createEventDispatcher();
  const attach = async () => {
    // Edge case: button is only enabled when principal is defined
    if (principal === undefined) {
      toastsError({
        labelKey: "error.principal_not_valid",
      });
      return;
    }
    startBusy({ initiator: "link-canister" });
    const { success } = await attachCanister({
      canisterId: principal,
      name,
    });
    stopBusy("link-canister");
    if (success) {
      toastsSuccess({
        labelKey: "canisters.link_canister_success",
        substitutions: {
          $canisterId: principal.toText(),
        },
      });
      // Leave modal open if not successful in case the error can be fixed.
      dispatcher("nnsClose");
    }
  };
</script>

<Modal testId="link-canister-modal-component" on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="link-canister-modal-title"
      >{$i18n.canisters.link_canister}</span
    ></svelte:fragment
  >

  <form on:submit|preventDefault={attach}>
    <div class="fields">
      <PrincipalInput
        testId="canister-id-input"
        bind:principal
        placeholderLabelKey="core.principal_id"
        name="principal"
      >
        <svelte:fragment slot="label"
          >{$i18n.canisters.enter_canister_id}</svelte:fragment
        >
      </PrincipalInput>
      <InputWithError
        testId="canister-name-input"
        bind:value={name}
        inputType="text"
        placeholderLabelKey="canisters.name"
        name="canister-name"
        required={false}
        {errorMessage}
      >
        <svelte:fragment slot="label"
          >{$i18n.canisters.enter_name_label}</svelte:fragment
        >
      </InputWithError>
    </div>

    <div class="toolbar">
      <button
        class="secondary"
        type="button"
        data-tid="cancel-button"
        on:click={() => dispatcher("nnsClose")}
      >
        {$i18n.core.cancel}
      </button>
      <button
        data-tid="link-canister-button"
        class="primary"
        type="submit"
        disabled={principal === undefined || $busy || nonNullish(errorMessage)}
      >
        {$i18n.core.confirm}
      </button>
    </div>
  </form>
</Modal>

<style lang="scss">
  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
