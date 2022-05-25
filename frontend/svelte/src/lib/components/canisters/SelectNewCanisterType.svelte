<script>
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";
  import CardItem from "../ui/CardItem.svelte";

  const dispatcher = createEventDispatcher();
  const selectCreate = () => {
    dispatcher("nnsSelect", { type: "newCanisterCreate" });
  };
  const selectLink = () => {
    dispatcher("nnsSelect", { type: "newCanisterAttach" });
  };
</script>

<div class="wizard-wrapper">
  <CardItem
    title={$i18n.canisters.create_canister_title}
    subtitle={$i18n.canisters.create_canister_subtitle}
    testId="choose-create-as-new-canister"
    on:click={selectCreate}
  />
  <CardItem
    title={$i18n.canisters.link_canister_title}
    subtitle={$i18n.canisters.link_canister_subtitle}
    testId="choose-link-as-new-canister"
    on:click={selectLink}
  />
</div>

<style lang="scss">
  .wizard-wrapper {
    // Need to overwrite the default of wizrd-wrapper
    justify-content: center !important;
  }
</style>
