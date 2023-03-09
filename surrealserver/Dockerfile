FROM rust:1.67 as build

WORKDIR /src/surrealserver
COPY . .

RUN apt-get update && apt-get install -y \
    build-essential \
    libedit-dev \
    llvm \
    libclang-dev \
    pkg-config \
    libssl-dev

RUN cargo build --release

FROM debian:bullseye-slim

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y openssl

COPY --from=build /src/surrealserver/target/release/surrealserver /usr/local/bin/surrealserver

WORKDIR /usr/local/bin

RUN ln -s /usr/lib/x86_64-linux-gnu/libssl.so.1.1 /usr/lib/libssl.so.1.1 && \
    ln -s /usr/lib/x86_64-linux-gnu/libcrypto.so.1.1 /usr/lib/libcrypto.so.1.1

CMD ["surrealserver"]
