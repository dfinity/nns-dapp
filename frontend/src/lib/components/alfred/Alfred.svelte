<script lang="ts">
  import { goto } from "$app/navigation";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { filterAlfredItems, type AlfredItem } from "$lib/utils/alfred.utils";
  import { Backdrop, Input, themeStore } from "@dfinity/gix-components";
  import { debounce } from "@dfinity/utils";
  import { tick } from "svelte";
  import { fade } from "svelte/transition";

  let alfredVisible = $state(false);
  let alfredQuery = $state("");
  let selectedIndex = $state(0);
  let isProcessingKey = $state(false);
  let searchInput = $state<HTMLInputElement>();

  const principalId = $derived($authStore.identity?.getPrincipal().toText());
  const filteredItems = $derived(
    filterAlfredItems(alfredQuery, {
      isSignedIn: $authSignedInStore,
      theme: $themeStore,
    })
  );

  const processKeyWithDebounce = debounce(() => {
    isProcessingKey = false;
  }, 50);

  $effect(() => {
    if (filteredItems.length > 0) selectedIndex = 0;
  });

  const toggleAlfred = () => {
    alfredVisible = !alfredVisible;
    alfredQuery = "";
    selectedIndex = 0;

    if (alfredVisible) initializeAlfred();
  };

  const hideAlfred = () => {
    alfredVisible = false;
    alfredQuery = "";
  };

  const initializeAlfred = async () => {
    await tick();

    searchInput?.focus();
  };

  const handleKeyNavigation = (event: KeyboardEvent): void => {
    const prevIndex = selectedIndex;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        hideAlfred();
        break;
      case "ArrowDown":
        event.preventDefault();
        if (filteredItems.length > 0) {
          selectedIndex = (selectedIndex + 1) % filteredItems.length;
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (filteredItems.length > 0)
          selectedIndex =
            selectedIndex <= 0 ? filteredItems.length - 1 : selectedIndex - 1;
        break;
      case "Enter":
        event.preventDefault();
        if (filteredItems.length > 0) selectItem(filteredItems[selectedIndex]);
        break;
    }

    if (prevIndex !== selectedIndex) scrollToSelectedItem();
  };

  const scrollToSelectedItem = async () => {
    await tick();
    const selectedItem = document.getElementById(
      `alfred-item-${selectedIndex}`
    );

    if (selectedItem) {
      selectedItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  const selectItem = (item: AlfredItem) => {
    if (item.type === "page" && item.path) {
      goto(item.path);

      hideAlfred();
    } else if (item.type === "action" && item.action) {
      const context = {
        copyToClipboardValue: principalId,
      };
      item.action(context);

      hideAlfred();
    }
  };

  const onkeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      toggleAlfred();
      return;
    }

    if (!alfredVisible || isProcessingKey) return;

    isProcessingKey = true;
    handleKeyNavigation(event);
    processKeyWithDebounce();
  };

  const onmousedown = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const alfredMenu = document.getElementById("menu");

    if (!alfredVisible) return;
    if (alfredMenu && !alfredMenu.contains(target)) hideAlfred();
  };
</script>

<svelte:window {onkeydown} {onmousedown} />

{#if alfredVisible}
  <div
    class="overlay"
    transition:fade={{ duration: 150 }}
    aria-hidden="true"
    data-tid="alfred-component"
  >
    <Backdrop on:nnsClose={hideAlfred} />

    <div class="wrapper">
      <div class="menu">
        <div class="search">
          <Input
            inputType="text"
            name="alfred-search"
            placeholder="Search for pages or actions..."
            autocomplete="off"
            spellcheck={false}
            bind:value={alfredQuery}
            bind:inputElement={searchInput}
          />
        </div>

        <div class="results" role="listbox" aria-label="Search results">
          {#if filteredItems.length === 0}
            <div class="no-results">{$i18n.alfred.no_results}</div>
          {:else}
            <ul>
              {#each filteredItems as item, index}
                <li
                  id={`alfred-item-${index}`}
                  class:selected={index === selectedIndex}
                  role="option"
                  aria-selected={index === selectedIndex ? "true" : "false"}
                >
                  <button
                    class="item-button"
                    onclick={() => selectItem(item)}
                    aria-current={index === selectedIndex ? "true" : undefined}
                  >
                    <div class="item-icon">
                      <item.icon size="20" />
                    </div>
                    <div class="item-content">
                      <div class="item-title">{item.title}</div>
                      <div class="item-description">{item.description}</div>
                    </div>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/overlay";
  @use "@dfinity/gix-components/dist/styles/mixins/display";
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";

  .overlay {
    position: fixed;
    @include display.inset;

    z-index: calc(var(--modal-z-index) + 1);

    @include interaction.initial;

    .wrapper {
      position: absolute;
      top: 0;
      left: 50%;
      padding-top: 15vh;
      transform: translate(-50%, 0);

      .menu {
        width: 600px;
        max-width: 90%;
        margin: 0 auto;

        border-radius: var(--border-radius-2x);
        overflow: hidden;

        @include overlay.colors;
      }

      .search {
        display: flex;
        padding: var(--padding-2x) var(--padding-3x);

        --input-width: 100%;
      }

      .results {
        max-height: 400px;
        overflow-y: auto;

        padding: var(--padding);
        background: var(--overlay-content-background);
        color: var(--overlay-content-background-contrast);

        ul {
          list-style: none;
          margin: 0;
          padding: 0;

          li {
            padding: 0;
            margin: 0;

            .item-button {
              width: 100%;
              background: none;
              border: none;
              text-align: left;
              font-family: inherit;
              display: flex;
              align-items: center;
              gap: var(--padding-2x);
              padding: var(--padding-1_5x) var(--padding-2x);
              transition: all 0.15s ease;
              border-radius: var(--border-radius);

              &:hover {
                background-color: var(
                  --background-secondary,
                  rgba(0, 0, 0, 0.05)
                );
              }
            }
          }
        }

        li.selected .item-button {
          background-color: var(--background-secondary, rgba(0, 0, 0, 0.05));
          border-left-color: var(--primary);

          .item-title,
          .item-icon {
            color: var(--primary);
          }
        }

        .item-icon {
          width: var(--padding-4x);
          height: var(--padding-4x);

          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-color);
          flex-shrink: 0;
          border-radius: var(--padding);
          background: var(--background-secondary, rgba(0, 0, 0, 0.05));
          transition: all 0.15s ease;
        }

        .item-content {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: var(--padding-0_5x);

          .item-title {
            font-weight: var(--font-weight-bold);
            color: var(--text-color);
          }

          .item-description {
            color: var(--text-description);
            transition: all 0.15s ease;
            @include fonts.small();
          }
        }
      }

      .no-results {
        padding: 24px 16px;
        text-align: center;
        color: var(--text-description);
        font-style: italic;
      }
    }
  }
</style>
