FROM nginx:stable-alpine
COPY  build-artifact /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]