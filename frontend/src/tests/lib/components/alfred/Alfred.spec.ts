import { fireEvent, render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import Alfred from "$lib/components/alfred/Alfred.svelte";
import * as alfredUtils from "$lib/utils/alfred.utils";
import { authStore } from "$lib/stores/auth.store";
import { get } from "svelte/store";
import * as navigation from "$app/navigation";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { Theme, themeStore } from "@dfinity/gix-components";
import type { AlfredItem } from "$lib/utils/alfred.utils";
import type { Principal } from "@dfinity/principal";

// Mock dependencies
vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

// Mock AlfredItems for testing
const mockAlfredItems: AlfredItem[] = [
  {
    id: "item1",
    type: "page",
    title: "Test Item 1",
    description: "Test Description 1",
    path: "/test1",
    icon: vi.fn(),
  },
  {
    id: "item2",
    type: "page",
    title: "Test Item 2",
    description: "Test Description 2",
    path: "/test2",
    icon: vi.fn(),
  },
  {
    id: "action-item",
    type: "action",
    title: "Test Action",
    description: "Test Action Description",
    action: vi.fn(),
    icon: vi.fn(),
  },
];

describe("Alfred Component", () => {
  // Mock clipboard API
  const originalClipboard = { ...global.navigator.clipboard };
  const mockPrincipal = { toText: () => "test-principal-id" } as Principal;
  const mockWriteText = vi.fn();
  
  beforeEach(() => {
    // Mock filterAlfredItems to return our test items
    vi.spyOn(alfredUtils, "filterAlfredItems").mockImplementation(() => mockAlfredItems);
    
    // Reset goto mock
    vi.mocked(navigation.goto).mockReset();
    
    // Mock clipboard
    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText: mockWriteText },
      configurable: true,
    });
    
    // Mock authStore
    authStore.set({
      identity: { getPrincipal: () => mockPrincipal },
    } as any);
    
    // Set theme
    themeStore.select(Theme.LIGHT);
    
    // Reset document.getElementById
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id.startsWith("alfred-item-")) {
        return {
          scrollIntoView: vi.fn(),
        } as unknown as HTMLElement;
      }
      return null;
    });
  });
  
  afterEach(() => {
    // Restore clipboard
    Object.defineProperty(global.navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
    
    vi.restoreAllMocks();
  });
  
  it("should not be visible by default", () => {
    render(Alfred);
    const alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).not.toBeInTheDocument();
  });
  
  it("should open when Cmd+K or Ctrl+K is pressed", async () => {
    render(Alfred);
    
    // Initial state - not visible
    let alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).not.toBeInTheDocument();
    
    // Press Cmd+K
    await fireEvent.keyDown(window, { key: "k", metaKey: true });
    await tick();
    
    // Should be visible now
    alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).toBeInTheDocument();
    
    // Press Escape to close
    await fireEvent.keyDown(window, { key: "Escape" });
    await tick();
    
    // Should be hidden again
    alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).not.toBeInTheDocument();
    
    // Press Ctrl+K
    await fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await tick();
    
    // Should be visible again
    alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).toBeInTheDocument();
  });
  
  it("should navigate items with arrow keys", async () => {
    render(Alfred);
    
    // Open Alfred
    await fireEvent.keyDown(window, { key: "k", metaKey: true });
    await tick();
    
    // Initial state - first item selected
    let selectedItem = screen.getByText("Test Item 1").closest("li");
    expect(selectedItem).toHaveAttribute("aria-selected", "true");
    
    // Navigate down
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    await tick();
    
    // Second item should be selected
    selectedItem = screen.getByText("Test Item 2").closest("li");
    expect(selectedItem).toHaveAttribute("aria-selected", "true");
    
    // Navigate down again
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    await tick();
    
    // Third item should be selected
    selectedItem = screen.getByText("Test Action").closest("li");
    expect(selectedItem).toHaveAttribute("aria-selected", "true");
    
    // Navigate down again (should wrap to first)
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    await tick();
    
    // First item should be selected again
    selectedItem = screen.getByText("Test Item 1").closest("li");
    expect(selectedItem).toHaveAttribute("aria-selected", "true");
    
    // Navigate up (should go to last)
    await fireEvent.keyDown(window, { key: "ArrowUp" });
    await tick();
    
    // Last item should be selected
    selectedItem = screen.getByText("Test Action").closest("li");
    expect(selectedItem).toHaveAttribute("aria-selected", "true");
  });
  
  it("should select a page item with Enter key and navigate to it", async () => {
    render(Alfred);
    
    // Open Alfred
    await fireEvent.keyDown(window, { key: "k", metaKey: true });
    await tick();
    
    // Press Enter on first item
    await fireEvent.keyDown(window, { key: "Enter" });
    await tick();
    
    // Should call goto with correct path
    expect(navigation.goto).toHaveBeenCalledWith("/test1");
    
    // Alfred should close after selection
    const alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).not.toBeInTheDocument();
  });
  
  it("should select an action item and execute its action", async () => {
    render(Alfred);
    
    // Open Alfred
    await fireEvent.keyDown(window, { key: "k", metaKey: true });
    await tick();
    
    // Navigate to action item
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    await tick();
    
    // Press Enter on action item
    await fireEvent.keyDown(window, { key: "Enter" });
    await tick();
    
    // Action should be called
    const actionItem = mockAlfredItems.find(item => item.id === "action-item");
    expect(actionItem?.action).toHaveBeenCalled();
    
    // Alfred should close after action
    const alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).not.toBeInTheDocument();
  });
  
  it("should filter items based on search query", async () => {
    // Mock filterAlfredItems to simulate filtering
    vi.spyOn(alfredUtils, "filterAlfredItems").mockImplementation((query) => {
      if (!query) return mockAlfredItems;
      return mockAlfredItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
    });
    
    render(Alfred);
    
    // Open Alfred
    await fireEvent.keyDown(window, { key: "k", metaKey: true });
    await tick();
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText("Search for pages or actions...");
    await fireEvent.input(searchInput, { target: { value: "Test Item 1" } });
    await tick();
    
    // Should call filterAlfredItems with query
    expect(alfredUtils.filterAlfredItems).toHaveBeenCalledWith(
      "Test Item 1", 
      expect.objectContaining({ isSignedIn: expect.any(Boolean), theme: expect.any(String) })
    );
  });
  
  it("should show 'No results found' when no items match the search", async () => {
    // Mock empty results
    vi.spyOn(alfredUtils, "filterAlfredItems").mockReturnValue([]);
    
    render(Alfred);
    
    // Open Alfred
    await fireEvent.keyDown(window, { key: "k", metaKey: true });
    await tick();
    
    // Should show no results message
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });
  
  it("should close when clicking outside", async () => {
    render(Alfred);
    
    // Open Alfred
    await fireEvent.keyDown(window, { key: "k", metaKey: true });
    await tick();
    
    // Alfred should be open
    let alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).toBeInTheDocument();
    
    // Click outside
    await fireEvent.mouseDown(document.body);
    await tick();
    
    // Alfred should be closed
    alfredOverlay = screen.queryByRole("listbox", { name: "Search results" });
    expect(alfredOverlay).not.toBeInTheDocument();
  });
});