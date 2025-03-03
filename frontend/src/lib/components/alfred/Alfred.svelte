<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    alfredQuery,
    alfredVisible,
    filterAlfredItems,
    hideAlfred,
    type AlfredItem,
  } from "$lib/stores/alfred";
  import {
    IconAccountsPage,
    IconCanistersPage,
    IconHeldTokens,
    IconHome,
    IconLogin,
    IconLogout,
    IconNeuronsPage,
    IconSettings,
  } from "@dfinity/gix-components";
  import { onDestroy, onMount, tick } from "svelte";
  import { fade } from "svelte/transition";

  let searchInput: HTMLInputElement;
  let selectedIndex = 0;
  let filteredItems: AlfredItem[] = [];
  let isProcessingKey = false; // To prevent duplicate key events
  let resultsContainer: HTMLDivElement;

  // Map of icon names to their components
  const iconMap: Record<string, any> = {
    home: IconHome,
    wallet: IconHeldTokens,
    brain: IconNeuronsPage,
    box: IconCanistersPage,
    creditCard: IconAccountsPage,
    settings: IconSettings,
    logOut: IconLogout,
    logIn: IconLogin,
    theme: IconSettings, // Using settings icon as fallback for theme toggle
  };

  // Subscribe to query changes to update filtered items
  $: {
    filteredItems = filterAlfredItems($alfredQuery);
    selectedIndex = 0; // Reset selection when query changes
  }

  // Reset scroll and focus input when Alfred becomes visible
  $: if ($alfredVisible) {
    initializeAlfred();
  }

  // When selected index changes due to keyboard navigation, scroll to keep it visible
  $: if ($alfredVisible && filteredItems.length > 0 && isProcessingKey) {
    scrollToSelectedItem();
  }

  // Initialize Alfred when it opens
  const initializeAlfred = async () => {
    await tick();
    // Focus the search input
    searchInput?.focus();
    // Reset scroll position
    if (resultsContainer) {
      resultsContainer.scrollTop = 0;
    }
  };

  // Scroll to the currently selected item
  const scrollToSelectedItem = async () => {
    await tick(); // Wait for DOM update
    const selectedItem = document.getElementById(
      `alfred-item-${selectedIndex}`
    );

    if (selectedItem && resultsContainer) {
      // Get item position relative to the scroll container
      const containerTop = resultsContainer.scrollTop;
      const containerBottom = containerTop + resultsContainer.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;

      // Scroll if item is outside visible area
      if (itemTop < containerTop) {
        // Item is above visible area, scroll up
        resultsContainer.scrollTop = itemTop;
      } else if (itemBottom > containerBottom) {
        // Item is below visible area, scroll down
        resultsContainer.scrollTop = itemBottom - resultsContainer.clientHeight;
      }
    }
  };

  // Calculate how much scrolling is needed to make an item visible
  const calculateScrollNeeded = (
    selectedItem: HTMLElement | null
  ): number | null => {
    if (!selectedItem || !resultsContainer) return null;

    // Get positions
    const containerTop = resultsContainer.scrollTop;
    const containerBottom = containerTop + resultsContainer.clientHeight;
    const itemTop = selectedItem.offsetTop;
    const itemBottom = itemTop + selectedItem.offsetHeight;

    // Determine if and how much to scroll
    if (itemTop < containerTop) {
      // Item is above visible area - scroll up exactly as needed
      return itemTop - containerTop; // Will be negative
    } else if (itemBottom > containerBottom) {
      // Item is below visible area - scroll down exactly as needed
      return itemBottom - containerBottom; // Will be positive
    }

    // No scrolling needed if fully visible
    return null;
  };

  // Handle keyboard navigation
  const handleKeydown = async (event: KeyboardEvent) => {
    if (!$alfredVisible || isProcessingKey) return;

    isProcessingKey = true;

    const key = event.key;
    const prevIndex = selectedIndex;

    switch (key) {
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
        if (filteredItems.length > 0) {
          selectedIndex =
            selectedIndex <= 0 ? filteredItems.length - 1 : selectedIndex - 1;
        }
        break;
      case "Enter":
        event.preventDefault();
        if (filteredItems.length > 0) {
          selectItem(filteredItems[selectedIndex]);
        }
        break;
    }

    // If selection changed, ensure it's visible
    if (prevIndex !== selectedIndex) {
      await tick(); // Wait for DOM update
      const selectedItem = document.getElementById(
        `alfred-item-${selectedIndex}`
      );
      const scrollAmount = calculateScrollNeeded(selectedItem);

      if (scrollAmount !== null && resultsContainer) {
        resultsContainer.scrollTop += scrollAmount;
      }
    }

    // Reset processing flag after a short delay
    setTimeout(() => {
      isProcessingKey = false;
    }, 50);
  };

  // Handle selecting an item
  const selectItem = (item: AlfredItem) => {
    if (item.type === "page" && item.path) {
      goto(item.path);
      hideAlfred();
    } else if (item.type === "action" && item.action) {
      item.action();
      hideAlfred();
    }
  };

  // Handle clicks outside the menu to close it
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const alfredMenu = document.getElementById("alfred-menu");

    if (alfredMenu && !alfredMenu.contains(target)) {
      hideAlfred();
    }
  };

  // Set up keyboard and outside click handlers
  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });
</script>

{#if $alfredVisible}
  <div
    class="alfred-overlay"
    transition:fade={{ duration: 150 }}
    on:keydown|stopPropagation={handleKeydown}
    aria-hidden="true"
  >
    <div class="alfred-menu" id="alfred-menu">
      <div class="alfred-search">
        <input
          type="text"
          bind:this={searchInput}
          bind:value={$alfredQuery}
          placeholder="Search for pages or actions..."
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="alfred-results" bind:this={resultsContainer}>
        {#if filteredItems.length === 0}
          <div class="alfred-no-results">No results found</div>
        {:else}
          <ul>
            {#each filteredItems as item, index}
              <li
                id={`alfred-item-${index}`}
                class:selected={index === selectedIndex}
                on:click={() => selectItem(item)}
              >
                {#if item.icon && iconMap[item.icon]}
                  <div class="item-icon">
                    <svelte:component this={iconMap[item.icon]} />
                  </div>
                {/if}
                <div class="item-content">
                  <div class="item-title">{item.title}</div>
                  <div class="item-description">{item.description}</div>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .alfred-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 15vh;
    z-index: 1000;
    backdrop-filter: blur(3px);
  }

  .alfred-menu {
    width: 600px;
    max-width: 90%;
    background-color: var(--background-primary, white);
    border-radius: var(--border-radius-2x, 8px);
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--background-secondary, rgba(0, 0, 0, 0.1));
  }

  .alfred-search {
    display: flex;
    padding: var(--padding-2x) var(--padding-3x);
    border-bottom: 1px solid var(--background-secondary, rgba(0, 0, 0, 0.1));
    background-color: var(--background-primary, white);

    input {
      width: 100%;
      padding: var(--padding-1_5x);
      border: none;
      background-color: var(--background-secondary, rgba(0, 0, 0, 0.05));
      border-radius: var(--border-radius, 4px);
      font-size: 16px;
      color: var(--text-primary, rgba(0, 0, 0, 0.8));
      transition: all 0.2s ease;
      box-shadow: inset 0 0 0 1px
        var(--background-secondary, rgba(0, 0, 0, 0.1));

      &:focus {
        outline: none;
        box-shadow: inset 0 0 0 2px var(--primary-color, #3b82f6);
      }

      &::placeholder {
        color: var(--text-secondary, rgba(0, 0, 0, 0.5));
        opacity: 0.7;
      }
    }
  }

  .alfred-results {
    max-height: 400px;
    overflow-y: auto;
    padding: 8px 16px;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--text-secondary, rgba(0, 0, 0, 0.2));
      border-radius: 20px;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.15s ease;
      margin: 3px 0;
      border-radius: var(--border-radius, 4px);
      position: relative;
      border-left: 3px solid transparent;

      &:hover {
        background-color: var(--background-secondary, rgba(0, 0, 0, 0.05));
      }

      &.selected {
        background-color: var(--background-secondary, rgba(0, 0, 0, 0.05));
        border-left-color: var(--primary-color, #3b82f6);

        .item-title {
          color: var(--primary-color, #3b82f6);
        }

        .item-icon {
          color: var(--primary-color, #3b82f6);
        }
      }
    }

    .item-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary, rgba(0, 0, 0, 0.5));
      flex-shrink: 0;
      border-radius: 8px;
      background: var(--background-secondary, rgba(0, 0, 0, 0.05));
      transition: all 0.15s ease;

      :global(svg) {
        width: 20px;
        height: 20px;
      }
    }

    .item-content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .item-title {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 16px;
      color: var(--text-primary, rgba(0, 0, 0, 0.8));
    }

    .item-description {
      font-size: 14px;
      color: var(--text-secondary, rgba(0, 0, 0, 0.6));
      transition: all 0.15s ease;
    }
  }

  .alfred-no-results {
    padding: 24px 16px;
    text-align: center;
    color: var(--text-secondary, rgba(0, 0, 0, 0.5));
    font-style: italic;
  }
</style>
