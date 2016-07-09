FROM mysql:5.7

RUN mkdir /appdata
RUN chown -R mysql:mysql /appdata
RUN chmod -R 755 /appdata

VOLUME /appdata

# We don't want this container to run, just exist
ENTRYPOINT /bin/echo Data-only container for mysql
