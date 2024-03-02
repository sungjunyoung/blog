FROM alpine:3.18 as builder

RUN apk add --no-cache --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community hugo

WORKDIR /sungjunyoung.github.io
ADD . /sungjunyoung.github.io

RUN hugo --minify

FROM nginx:1.14.2

COPY --from=builder /sungjunyoung.github.io/public /usr/share/nginx/html
