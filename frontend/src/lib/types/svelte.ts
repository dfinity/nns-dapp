import type { Component } from "svelte";

// TODO: make this type generic
export type ComponentWithProps = {
  Component: Component;
  props?: Record<string, unknown>;
};
