FROM nginx:1.14.2

ADD public /public
RUN mv /public/* /usr/share/nginx/html/
