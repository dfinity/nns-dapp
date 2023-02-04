<script lang="ts">
  import {
    Checkbox,
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from "svelte";
  import AddPrincipal from "$lib/components/common/AddPrincipal.svelte";
  import { SnsNeuronPermissionType, type SnsNeuronId } from "@dfinity/sns";
  import { addNeuronPermissions } from "$lib/api/sns-governance.api";
  import { getCurrentIdentity } from "$lib/services/auth.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { enumValues } from "$lib/utils/enum.utils";
  import { permissionI18nMapper } from "$lib/i18n/dev-i18n";
  import { toastsError } from "$lib/stores/toasts.store";

  export let neuronId: SnsNeuronId;
  export let rootCanisterId: Principal;
  export let reloadNeuron: () => Promise<void>;

  const steps: WizardSteps = [
    {
      name: "AddPrincipal",
      title: "Add Principal",
    },
    {
      name: "AddPermissions",
      title: "Select Permissions",
    },
  ];

  let currentStep: WizardStep;
  let modal: WizardModal;

  let principal: Principal | undefined = undefined;
  const dispatcher = createEventDispatcher();

  let selectablePermissions = enumValues(SnsNeuronPermissionType).map(
    (permission) => ({
      permission,
      checked: true,
    })
  );
  const toggle = (permission: SnsNeuronPermissionType) => {
    selectablePermissions = selectablePermissions.map((p) =>
      p.permission === permission ? { ...p, checked: !p.checked } : p
    );
  };

  const add = async () => {
    if (principal !== undefined) {
      try {
        const identity = await getCurrentIdentity();
        startBusy({ initiator: "dev-add-sns-neuron-permissions" });
        await addNeuronPermissions({
          permissions: selectablePermissions
            .filter((p) => p.checked)
            .map((p) => p.permission),
          identity,
          principal,
          rootCanisterId,
          neuronId,
        });
        await reloadNeuron();
        dispatcher("nnsClose");
      } catch (err) {
        console.error(err);
        toastsError({ labelKey: "error.adding_permissions", err });
      } finally {
        stopBusy("dev-add-sns-neuron-permissions");
      }
    }
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>

  {#if currentStep.name === "AddPrincipal"}
    <AddPrincipal
      bind:principal
      on:nnsSelectPrincipal={() => modal.next()}
      on:nnsClose
    >
      <span slot="title">Principal with new permissions</span>
      <span slot="button">{$i18n.core.next}</span>
    </AddPrincipal>
  {/if}

  {#if currentStep.name === "AddPermissions"}
    <p>{`Select permissions for ${principal?.toText()}`}</p>
    {#each selectablePermissions as { checked, permission }}
      <Checkbox
        inputId={String(permission)}
        {checked}
        on:nnsChange={() => toggle(permission)}
        >{permissionI18nMapper[permission]}</Checkbox
      >
    {/each}
    <div class="toolbar">
      <button class="secondary" type="button" on:click={() => modal.back()}>
        Edit Principal
      </button>
      <button class="primary" type="button" on:click={add}>
        {$i18n.core.confirm}
      </button>
    </div>
  {/if}
</WizardModal>
