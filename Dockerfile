# Use this with
#
# docker build -t nns-dapp .
# docker run --rm --entrypoint cat nns-dapp /nns-dapp.wasm > nns-dapp.wasm

FROM ubuntu:20.10

ARG rust_version=1.54.0
ENV NODE_VERSION=14.15.4

ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt -yq update && \
    apt -yqq install --no-install-recommends curl ca-certificates \
        build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang cmake \
	git

# Install node
RUN curl --fail -sSf https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# Install Rust and Cargo in /opt
ENV RUSTUP_HOME=/opt/rustup \
    CARGO_HOME=/opt/cargo \
    PATH=/opt/cargo/bin:$PATH

RUN curl --fail https://sh.rustup.rs -sSf \
        | sh -s -- -y --default-toolchain ${rust_version}-x86_64-unknown-linux-gnu --no-modify-path && \
    rustup default ${rust_version}-x86_64-unknown-linux-gnu && \
    rustup target add wasm32-unknown-unknown

ENV PATH=/cargo/bin:$PATH

RUN curl https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_2.2.3-stable.tar.xz -o flutter.tar.xz
RUN tar xJf flutter.tar.xz
ENV PATH=/flutter/bin:$PATH

# Install IC CDK optimizer
RUN cargo install --version 0.3.1 ic-cdk-optimizer

COPY . .

ENV DEPLOY_ENV=mainnet
RUN cd frontend/ts && ./build.sh

RUN cd frontend/dart && flutter build web --web-renderer html --release --no-sound-null-safety --pwa-strategy=none --dart-define=FLUTTER_WEB_CANVASKIT_URL=/assets/canvaskit/
# Remove random hash from flutter output
RUN sed -i -e 's/flutter_service_worker.js?v=[0-9]*/flutter_service_worker.js/' frontend/dart/build/web/index.html

# Bundle into a tight tarball
RUN cd frontend/dart/build/web/ && tar cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f ../../../../assets.tar.xz .
RUN ls -sh assets.tar.xz; sha256sum assets.tar.xz

RUN cargo build --locked --target wasm32-unknown-unknown --release --package nns-dapp
RUN cp target/wasm32-unknown-unknown/release/nns-dapp.wasm .
RUN ic-cdk-optimizer nns-dapp.wasm -o nns-dapp.wasm
RUN ls -sh nns-dapp.wasm; sha256sum nns-dapp.wasm
