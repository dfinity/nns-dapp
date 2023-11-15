import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { derived, type Readable } from "svelte/store";
import { tokensListBaseStore } from "./tokens-list-base.derived";

const addVisitorActions = (data: UserTokenData): UserTokenData => ({
  ...data,
  actions: [UserTokenAction.GoToDetail],
});

export const tokensListVisitorsStore = derived<
  Readable<UserTokenData[]>,
  UserTokenData[]
>(tokensListBaseStore, (tokensData) => tokensData.map(addVisitorActions));
