<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
    type Filter,
    type FiltersData,
    type NnsProposalFilterCategory,
    type SnsProposalFilterCategory,
  } from "$lib/types/filters";
  import { Checkbox, Modal, Spinner } from "@dfinity/gix-components";
  import { Topic } from "@dfinity/nns";
  import { isNullish } from "@dfinity/utils";
  import { createEventDispatcher, type Snippet } from "svelte";

  type Props = {
    // `undefined` means the filters are not loaded yet.
    filters: Filter<FiltersData>[] | undefined;
    visible?: boolean;
    category?:
      | NnsProposalFilterCategory
      | SnsProposalFilterCategory
      | undefined;
  };

  const { filters, visible = true, category }: Props = $props();
  const loading = $derived(isNullish(filters));

  const dispatch = createEventDispatcher();

  const onChange = (id: string) => {
    const filter = filters?.find((f) => f.id === id);
    dispatch("nnsChange", { filter });
  };
  const close = () => dispatch("nnsClose");
  const filter = () => dispatch("nnsConfirm");
  const selectAll = () => dispatch("nnsSelectAll");
  const clearSelection = () => dispatch("nnsClearSelection");

  /**
   * Determines whether to display a separator after a filter item in a list.
   *
   * @param category - The current filter category
   * @param filters - The array of all filters
   * @param index - The index of the current filter being evaluated
   * @returns True if a separator should be displayed after this filter, false otherwise
   */
  const displaySeparator = (
    category: Props["category"],
    filters: Filter<FiltersData>[],
    index: number
  ) => {
    // Only show separators if "topics" category
    if (category !== "topics") return false;

    const currentEntry = filters[index];

    // Always show separator after SNS and Community Fund topic
    if (currentEntry.value === Topic.SnsAndCommunityFund) return true;

    const nextEntry = filters[index + 1];
    if (isNullish(nextEntry)) return false;

    // Show separator between critical and non-critical topics
    if (currentEntry.isCritical && !nextEntry.isCritical) return true;

    // Show separator before the "All SNS proposals without topic" special filter
    if (nextEntry.value === ALL_SNS_PROPOSALS_WITHOUT_TOPIC) return true;

    return false;
  };
</script>

{#if !loading}
  <Modal {visible} on:nnsClose role="alert" testId="filter-modal">
    <!-- TODO: To fix once Modal slots are migrated in gix -->
    <!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
    <!-- svelte-ignore slot_element_deprecated -->
    <slot slot="title" name="title" />

    <div slot="sub-title" class="toggle-all-wrapper">
      <button
        class="text"
        data-tid="filter-modal-select-all"
        aria-label={$i18n.core.filter_select_all}
        onclick={selectAll}>{$i18n.voting.check_all}</button
      >
      <button
        class="text"
        data-tid="filter-modal-clear"
        aria-label={$i18n.core.filter_clear_all}
        onclick={clearSelection}>{$i18n.voting.uncheck_all}</button
      >
    </div>

    {#if filters}
      <div class="filters">
        {#each filters as { id, name, checked }, index (id)}
          <Checkbox
            testId={`filter-modal-option-${id}`}
            inputId={id}
            {checked}
            on:nnsChange={() => onChange(id)}>{name}</Checkbox
          >
          {#if displaySeparator(category, filters, index)}
            <Separator testId={`separator-${id}`} spacing="medium" />
          {/if}
        {/each}
      </div>
    {:else}
      <Spinner />
    {/if}

    <svelte:fragment slot="footer">
      <button
        class="secondary"
        type="button"
        aria-label={$i18n.core.filter_select_all}
        data-tid="close"
        onclick={close}
      >
        {$i18n.core.cancel}
      </button>
      <button
        class="primary"
        type="button"
        aria-label={$i18n.core.filter_clear_all}
        onclick={filter}
        data-tid="apply-filters"
      >
        {$i18n.core.filter}
      </button>
    </svelte:fragment>
  </Modal>
{:else}
  <Modal {visible} on:nnsClose role="alert" testId="filter-modal">
    <!-- TODO: To fix once Modal slots are migrated in gix -->
    <!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
    <!-- svelte-ignore slot_element_deprecated -->
    <slot slot="title" name="title" />

    <div class="spinner-wrapper">
      <Spinner />
    </div>
  </Modal>
{/if}

<style lang="scss">
  .filters {
    --checkbox-padding: var(--padding-2x) var(--padding) var(--padding-2x);
  }

  .toggle-all-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--padding);

    margin: 0 var(--padding-2x);
  }

  .spinner-wrapper {
    // Only to look good in the modal
    min-height: 200px;
  }
</style>
