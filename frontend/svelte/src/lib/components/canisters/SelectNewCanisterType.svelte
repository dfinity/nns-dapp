<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";
  import CardItem from "../ui/CardItem.svelte";

  const dispatcher = createEventDispatcher();
  const dispatchSelect = (type: "newCanisterCreate" | "newCanisterAttach") => {
    dispatcher("nnsSelect", { type });
  };
  const selectCreate = () => {
    dispatchSelect("newCanisterCreate");
  };
  const selectLink = () => {
    dispatchSelect("newCanisterAttach");
  };
</script>

<div class="wizard-wrapper wrapper">
  <CardItem testId="choose-create-as-new-canister" on:click={selectCreate}>
    <svelte:fragment slot="title"
      >{$i18n.canisters.create_canister_title}</svelte:fragment
    >
    <svelte:fragment slot="subtitle"
      >{$i18n.canisters.create_canister_subtitle}</svelte:fragment
    >
  </CardItem>
  <CardItem testId="choose-link-as-new-canister" on:click={selectLink}>
    <svelte:fragment slot="title"
      >{$i18n.canisters.link_canister_title}</svelte:fragment
    >
    <svelte:fragment slot="subtitle"
      >{$i18n.canisters.link_canister_subtitle}</svelte:fragment
    >
  </CardItem>
</div>

<style lang="scss">
  // Need to overwrite the default of wizrd-wrapper
  .wizard-wrapper.wrapper {
    justify-content: center !important;
  }
</style>
