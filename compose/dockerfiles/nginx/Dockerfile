FROM nginx:stable
MAINTAINER Rikworks

COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./mime.types /etc/nginx/mime.types
COPY ./nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
