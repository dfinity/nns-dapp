import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("snsTicketsStore", () => {
  const { ticket } = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });

  beforeEach(() => snsTicketsStore.reset());

  it("should set ticket", () => {
    snsTicketsStore.setTicket({
      rootCanisterId: mockPrincipal,
      ticket,
    });

    const $snsTicketsStore = get(snsTicketsStore);
    expect($snsTicketsStore[mockPrincipal.toText()].ticket).toEqual(ticket);
  });

  it("should set no-ticket for a project", () => {
    snsTicketsStore.setNoTicket(mockPrincipal);

    const $snsTicketsStore = get(snsTicketsStore);
    expect($snsTicketsStore[mockPrincipal.toText()].ticket).toBeNull();
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
