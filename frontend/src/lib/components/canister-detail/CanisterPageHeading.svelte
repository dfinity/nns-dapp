<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import PageHeading from "../common/PageHeading.svelte";
  import UnlinkCanisterButton from "./UnlinkCanisterButton.svelte";
  import RenameCanisterButton from "./RenameCanisterButton.svelte";
  import CanisterHeadingTitle from "./CanisterHeadingTitle.svelte";

  export let canisterDetails: CanisterDetails | undefined;
  export let canister: CanisterInfo;
  export let isController: boolean | undefined;
</script>

<!-- We can't set conditional slots. -->
{#if canister.name.length === 0}
  <PageHeading testId="canister-page-heading-component">
    <CanisterHeadingTitle
      slot="title"
      details={canisterDetails}
      {isController}
    />
    <svelte:fragment slot="tags">
      <UnlinkCanisterButton canisterId={canister.canister_id} />
      <RenameCanisterButton />
    </svelte:fragment>
  </PageHeading>
{:else}
  <PageHeading testId="canister-page-heading-component">
    <CanisterHeadingTitle
      slot="title"
      details={canisterDetails}
      {isController}
    />
    <span slot="subtitle" data-tid="subtitle">
      {canister.name}
    </span>
    <svelte:fragment slot="tags">
      <UnlinkCanisterButton canisterId={canister.canister_id} />
      <RenameCanisterButton />
    </svelte:fragment>
  </PageHeading>
{/if}
