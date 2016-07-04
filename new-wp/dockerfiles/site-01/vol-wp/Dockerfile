FROM wordpress:latest

RUN mkdir /appdata
RUN chown -R www-data:www-data /appdata
RUN chmod -R 755 /appdata

VOLUME /appdata

# We don't want this container to run, just exist
ENTRYPOINT /bin/echo Data-only container for wordpress
