FROM rust:1.67 as build


WORKDIR /src/productsserver
COPY . .

RUN apt-get update && apt-get install -y \
    build-essential \
    libedit-dev \
    llvm \
    libclang-dev
RUN cargo build --release


RUN find / -name "libclang*" 2>/dev/null

    
FROM gcr.io/distroless/cc-debian10

COPY --from=build /src/productsserver/target/release/productsserver /usr/local/bin/productsserver

WORKDIR /usr/local/bin

CMD ["productsserver"]