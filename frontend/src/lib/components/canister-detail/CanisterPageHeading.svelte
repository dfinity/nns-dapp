<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import HeadingSubtitle from "../common/HeadingSubtitle.svelte";
  import PageHeading from "../common/PageHeading.svelte";
  import CanisterHeadingTitle from "./CanisterHeadingTitle.svelte";
  import RenameCanisterButton from "./RenameCanisterButton.svelte";
  import UnlinkCanisterButton from "./UnlinkCanisterButton.svelte";

  export let canisterDetails: CanisterDetails | undefined;
  export let canister: CanisterInfo;
  export let isController: boolean | undefined;
</script>

<PageHeading testId="canister-page-heading-component">
  <CanisterHeadingTitle
    slot="title"
    details={canisterDetails}
    {canister}
    {isController}
  />
  <svelte:fragment slot="subtitle">
    {#if canister.name.length > 0 && isController}
      <HeadingSubtitle testId="subtitle">{canister.name}</HeadingSubtitle>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="tags">
    <UnlinkCanisterButton canisterId={canister.canister_id} />
    <RenameCanisterButton />
  </svelte:fragment>
</PageHeading>
