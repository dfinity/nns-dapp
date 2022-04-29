FROM rust:1.55.0 as builder

RUN rustup target add wasm32-unknown-unknown
RUN apt -yq update && \
    apt -yqq install --no-install-recommends build-essential pkg-config clang cmake && \
    apt autoremove --purge -y && \
    rm -rf /tmp/* /var/lib/apt/lists/* /var/tmp/*

RUN cargo install --version 0.3.2 ic-cdk-optimizer

# Hint: set this version to the hash of https://github.com/dfinity/ic commit you want to build.
ARG IC_VERSION=eba88796cf8dff32f5788c9167cdd8e292b6072a

RUN git clone https://github.com/dfinity/ic && \
    cd ic && \
    git reset --hard ${IC_VERSION} && \
    rm -rf .git && \
    cd ..

RUN git config --global url."https://github.com/".insteadOf git://github.com/

RUN export CARGO_TARGET_DIR=/ic/rs/target && \
    cd ic/rs/ && \
    cargo build --target wasm32-unknown-unknown --release -p ledger-canister && \
    ic-cdk-optimizer -o $CARGO_TARGET_DIR/ledger-canister.wasm $CARGO_TARGET_DIR/wasm32-unknown-unknown/release/ledger-canister.wasm

FROM scratch AS scratch
COPY --from=builder /ic/rs/target/ledger-canister.wasm /
COPY --from=builder /ic/rs/rosetta-api/ledger.did /ledger.private.did
COPY --from=builder /ic/rs/rosetta-api/ledger_canister/ledger.did /ledger.public.did
