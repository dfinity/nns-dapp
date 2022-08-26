FROM rust:1.61.0 as builder

RUN rustup target add wasm32-unknown-unknown
RUN apt -yq update && \
    apt -yqq install --no-install-recommends build-essential pkg-config clang cmake && \
    apt autoremove --purge -y && \
    rm -rf /tmp/* /var/lib/apt/lists/* /var/tmp/*

RUN cargo install --version 0.3.2 ic-cdk-optimizer

ARG IC_COMMIT

RUN git clone https://github.com/dfinity/ic && \
    cd ic && \
    git reset --hard ${IC_COMMIT} && \
    rm -rf .git && \
    cd ..

RUN git config --global url."https://github.com/".insteadOf git://github.com/

# Modify the code to make testing easier:
# - Provide maturity more rapidly.
COPY nns-canister.patch /tmp/
RUN cd /ic && patch -p1 < /tmp/nns-canister.patch

RUN export CARGO_TARGET_DIR=/ic/rs/target && \
    cd ic/rs/ && \
    cargo fetch

ENV CARGO_TARGET_DIR=/ic/rs/target
WORKDIR /ic/rs

# Note: This is available as a download however we patch the source code to make testing easier.
RUN binary="governance-canister" && \
    features="test" && \
    cargo build --target wasm32-unknown-unknown --profile canister-release --bin "$binary" --features "$features" && \
    ic-cdk-optimizer -o "$CARGO_TARGET_DIR/${binary}_${features}.wasm" "$CARGO_TARGET_DIR/wasm32-unknown-unknown/canister-release/${binary}.wasm"

## Note: This is available as a download however we patch the source code to make testing easier.
RUN binary=cycles-minting-canister && \
    cargo build --target wasm32-unknown-unknown --profile canister-release --bin "$binary" && \
    ic-cdk-optimizer -o "$CARGO_TARGET_DIR/${binary}.wasm" "$CARGO_TARGET_DIR/wasm32-unknown-unknown/canister-release/${binary}.wasm"

RUN binary=sns-swap-canister && \
    cargo build --target wasm32-unknown-unknown --profile canister-release --bin "$binary" && \
    ic-cdk-optimizer -o "$CARGO_TARGET_DIR/${binary}.wasm" "$CARGO_TARGET_DIR/wasm32-unknown-unknown/canister-release/${binary}.wasm"

FROM scratch AS scratch
COPY --from=builder /ic/rs/nns/governance/canister/governance.did /governance.did
COPY --from=builder /ic/rs/rosetta-api/ledger.did /ledger.private.did
COPY --from=builder /ic/rs/rosetta-api/ledger_canister/ledger.did /ledger.did
COPY --from=builder /ic/rs/rosetta-api/icrc1/ledger/icrc1.did /ic-icrc1-ledger.did
COPY --from=builder /ic/rs/rosetta-api/icrc1/archive/archive.did /ic-icrc1-archive.did
COPY --from=builder /ic/rs/nns/gtc/canister/gtc.did /genesis_token.did
COPY --from=builder /ic/rs/nns/cmc/cmc.did /cmc.did
COPY --from=builder /ic/rs/nns/sns-wasm/canister/sns-wasm.did /sns_wasm.did
COPY --from=builder /ic/rs/sns/swap/canister/swap.did /sns_swap.did
COPY --from=builder /ic/rs/sns/root/canister/root.did /sns_root.did
COPY --from=builder /ic/rs/sns/governance/canister/governance.did /sns_governance.did
COPY --from=builder /ic/rs/target/*.wasm /
