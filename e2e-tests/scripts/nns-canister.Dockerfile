FROM rust:1.55.0 as builder

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

COPY nns-canister.patch /tmp/
RUN cd /ic && patch -p1 < /tmp/nns-canister.patch

RUN export CARGO_TARGET_DIR=/ic/rs/target && \
    cd ic/rs/ && \
    cargo build --target wasm32-unknown-unknown --release -p ledger-canister && \
    ic-cdk-optimizer -o $CARGO_TARGET_DIR/ledger-canister.wasm $CARGO_TARGET_DIR/wasm32-unknown-unknown/release/ledger-canister.wasm

FROM scratch AS scratch
COPY --from=builder /ic/rs/target/ledger-canister.wasm /
COPY --from=builder /ic/rs/rosetta-api/ledger.did /ledger.private.did
COPY --from=builder /ic/rs/rosetta-api/ledger_canister/ledger.did /ledger.public.did
