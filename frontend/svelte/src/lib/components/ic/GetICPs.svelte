<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import Modal from "../../modals/Modal.svelte";
  import Input from "../ui/Input.svelte";

  let visible: boolean;

  let inputValue: number | undefined = undefined;

  const onSubmit = ({ target }) => {
    // TODO: L2-188 - check if form is valid i.e. !invalidForm

    const formData: FormData = new FormData(target);
    console.log(formData.get("icp"));

    // TODO: L2-188 - Get ICPs on testnet
    alert("Not implemented yet");
  };

  const onClose = () => {
    visible = false;
    inputValue = undefined;
  };

  let invalidForm: boolean;

  $: invalidForm = inputValue === undefined || inputValue <= 0;
</script>

<button on:click={() => (visible = true)} class="open text">Get ICPs</button>

<Modal {visible} on:nnsClose={onClose}>
  <span slot="title">Get ICPs</span>

  <form on:submit|preventDefault={onSubmit}>
    <span class="how-much">How much?</span>

    <Input placeholderLabelKey="core.icp" name="icp" bind:value={inputValue} />

    <button type="submit" class="submit" disabled={invalidForm}>Get</button>
  </form>
</Modal>

<style lang="scss">
  .open {
    justify-self: flex-start;
  }

  .how-much {
    margin-bottom: calc(var(--padding) / 2);
  }

  form {
    display: flex;
    flex-direction: column;

    padding: calc(2 * var(--padding));
  }
</style>
