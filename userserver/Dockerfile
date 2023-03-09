FROM rust:1.67 as build


WORKDIR /src/userserver
COPY . .

RUN apt-get update && apt-get install -y \
    build-essential \
    libedit-dev \
    llvm \
    libclang-dev
RUN cargo build --release


RUN find / -name "libclang*" 2>/dev/null

    
FROM gcr.io/distroless/cc-debian10

COPY --from=build /src/userserver/target/release/userserver /usr/local/bin/userserver

WORKDIR /usr/local/bin

CMD ["userserver"]