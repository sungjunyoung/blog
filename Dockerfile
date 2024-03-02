FROM nginx:1.14.2

ADD public /sungjunyoung.github.io/public
COPY --from=builder /sungjunyoung.github.io/public /usr/share/nginx/html
