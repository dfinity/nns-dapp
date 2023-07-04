<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { busy, Modal } from "@dfinity/gix-components";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { attachCanister } from "$lib/services/canisters.services";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher } from "svelte";
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";

  let principal: Principal | undefined;
  let name = "";

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

<Modal on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="link-canister-modal-title"
      >{$i18n.canisters.link_canister}</span
    ></svelte:fragment
  >

  <form on:submit|preventDefault={attach}>
    <div class="fields">
      <PrincipalInput
        bind:principal
        placeholderLabelKey="core.principal_id"
        name="principal"
      >
        <svelte:fragment slot="label"
          >{$i18n.canisters.enter_canister_id}</svelte:fragment
        >
      </PrincipalInput>
      <InputWithError
        bind:value={name}
        inputType="text"
        placeholderLabelKey="canisters.name"
        name="canister-name"
        required={false}
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
        data-tid="add-principal-button"
        class="primary"
        type="submit"
        disabled={principal === undefined || $busy}
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
