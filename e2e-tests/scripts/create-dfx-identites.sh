#!/bin/bash

DFX_DIR="$HOME/.config/dfx/"
DFX_IDENT_DIR="$HOME/.config/dfx/identity"

cd "$(dirname $0)"

for I in {1..4}
do
	echo "Creating dfx identity 'ident-$I' at $DFX_IDENT_DIR/ident-$I/identity.pem"
	rm -rf "$DFX_IDENT_DIR/ident-$I"
	mkdir -p "$DFX_IDENT_DIR/ident-$I"
	cp ../sns-init-assets/identity-$I.pem "$DFX_IDENT_DIR/ident-$I/identity.pem"
	sed -i -e 1,3d "$DFX_IDENT_DIR/ident-$I/identity.pem" 
	dfx identity use ident-$I
	PRINCIPAL_ID=$(dfx identity get-principal)
	ACCOUNT_ID=$(dfx ledger account-id)
	echo "PrincipalId: $PRINCIPAL_ID" 
	echo "AccountId: $ACCOUNT_ID"

	echo ""
done

dfx identity use ident-1

