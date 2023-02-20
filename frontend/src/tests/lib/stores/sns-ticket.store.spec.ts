import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { rootCanisterIdMock } from "../../mocks/sns.api.mock";
import { snsTicketMock } from "../../mocks/sns.mock";

describe("snsTicketsStore", () => {
  const { ticket } = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });

  afterEach(() => snsTicketsStore.reset());

  it("should set ticket", () => {
    snsTicketsStore.setTicket({
      rootCanisterId: mockPrincipal,
      ticket,
    });

    const $snsTicketsStore = get(snsTicketsStore);
    expect($snsTicketsStore[mockPrincipal.toText()].ticket).toEqual(ticket);
  });

  it("should remove ticket for a project", () => {
    snsTicketsStore.setTicket({
      rootCanisterId: mockPrincipal,
      ticket,
    });
    snsTicketsStore.removeTicket(mockPrincipal);

    const $snsTicketsStore = get(snsTicketsStore);
    expect($snsTicketsStore[mockPrincipal.toText()]).toBeUndefined();
  });

  it("should add ticket for another project", () => {
    const principal2 = Principal.fromText("aaaaa-aa");

    snsTicketsStore.setTicket({
      rootCanisterId: mockPrincipal,
      ticket: ticket,
    });
    snsTicketsStore.setTicket({
      rootCanisterId: principal2,
      ticket: null,
    });
    const $snsTicketsStore = get(snsTicketsStore);
    expect($snsTicketsStore[mockPrincipal.toText()].ticket).toEqual(ticket);
    expect($snsTicketsStore[principal2.toText()].ticket).toEqual(null);
  });
});
