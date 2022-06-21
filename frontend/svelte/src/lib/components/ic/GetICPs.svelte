<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import Modal from "../../modals/Modal.svelte";
  import Input from "../ui/Input.svelte";
  import { getICPs } from "../../services/dev.services";
  import Spinner from "../ui/Spinner.svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import IconAccountBalance from "../../icons/IconAccountBalance.svelte";

  let visible: boolean = false;
  let transferring: boolean = false;

  let inputValue: number | undefined = undefined;

  const onSubmit = async ({ target }) => {
    if (invalidForm) {
      toastsStore.error({
        labelKey: "Invalid ICPs input.",
      });
      return;
    }

    const formData: FormData = new FormData(target);
    const icps: number = formData.get("icp") as unknown as number;

    transferring = true;

    try {
      await getICPs(icps);

      reset();
    } catch (err: unknown) {
      toastsStore.error({
        labelKey: "ICPs could not be transferred.",
        err,
      });
    }

    transferring = false;
  };

  const onClose = () => reset();

  const reset = () => {
    visible = false;
    inputValue = undefined;
  };

  let invalidForm: boolean;

  $: invalidForm = inputValue === undefined || inputValue <= 0;
</script>

<button
  role="menuitem"
  data-tid="get-icp-button"
  on:click={() => (visible = true)}
  class="open"
>
  <IconAccountBalance />
  <span>Get ICPs</span>
</button>

<Modal {visible} on:nnsClose={onClose}>
  <span slot="title">Get ICPs</span>

  <form data-tid="get-icp-form" on:submit|preventDefault={onSubmit}>
    <span class="how-much">How much?</span>

    <Input
      placeholderLabelKey="core.icp"
      name="icp"
      inputType="icp"
      bind:value={inputValue}
      disabled={transferring}
    />

    <button
      data-tid="get-icp-submit"
      type="submit"
      class="primary"
      disabled={invalidForm || transferring}
    >
      {#if transferring}
        <Spinner />
      {:else}
        Get
      {/if}
    </button>
  </form>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  .open {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    font-size: var(--font-size-h4);
    font-weight: 700;

    padding: var(--padding-2x);

    &:focus,
    &:hover {
      background: var(--background-tint);
    }

    span {
      margin: 0 0 0 var(--padding);
    }
  }

  @include media.light-theme() {
    .open {
      &:focus,
      &:hover {
        background: var(--background-shade);
      }
    }
  }

  @include media.light-theme() {
    .how-much {
      color: var(--background-contrast);
    }
  }

  .how-much {
    margin-bottom: var(--padding-0_5x);
  }

  form {
    display: flex;
    flex-direction: column;

    padding: var(--padding-2x);

    button {
      margin-top: var(--padding-0_5x);
    }
  }
</style>
