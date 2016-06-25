# WARNING - this file is adapted from 
# https://github.com/docker-library/wordpress/blob/master/apache/Dockerfile
# need to check at regular intervals for changes to that file, and reflect them here
# Rikworks changes are shown in two blocks below; original code commented out:
# IMPORTANT: also remove any VOLUME commands found in the official Dockerfile

FROM php:5.6-apache

RUN a2enmod rewrite expires

# install the PHP extensions we need
# !!! RIKWORKS CHANGES 1 !!!
# additional PHP extensions, as required by plugins, should be added here
# RUN apt-get update && apt-get install -y libpng12-dev libjpeg-dev && rm -rf /var/lib/apt/lists/* \
# 	&& docker-php-ext-configure gd --with-png-dir=/usr --with-jpeg-dir=/usr \
# 	&& docker-php-ext-install gd mysqli opcache
RUN apt-get update && apt-get install -y libpng12-dev libjpeg-dev && rm -rf /var/lib/apt/lists/* \
	&& docker-php-ext-configure gd --with-png-dir=/usr --with-jpeg-dir=/usr \
	&& docker-php-ext-install gd mysqli opcache
# !!! ENDS RIKWORKS CHANGES 1 !!!

# set recommended PHP.ini settings
# see https://secure.php.net/manual/en/opcache.installation.php
RUN { \
		echo 'opcache.memory_consumption=128'; \
		echo 'opcache.interned_strings_buffer=8'; \
		echo 'opcache.max_accelerated_files=4000'; \
		echo 'opcache.revalidate_freq=60'; \
		echo 'opcache.fast_shutdown=1'; \
		echo 'opcache.enable_cli=1'; \
	} > /usr/local/etc/php/conf.d/opcache-recommended.ini

ENV WORDPRESS_VERSION 4.5.3
ENV WORDPRESS_SHA1 835b68748dae5a9d31c059313cd0150f03a49269

# upstream tarballs include ./wordpress/ so this gives us /usr/src/wordpress
RUN curl -o wordpress.tar.gz -SL https://wordpress.org/wordpress-${WORDPRESS_VERSION}.tar.gz \
	&& echo "$WORDPRESS_SHA1 *wordpress.tar.gz" | sha1sum -c - \
	&& tar -xzf wordpress.tar.gz -C /usr/src/ \
	&& rm wordpress.tar.gz \
	&& chown -R www-data:www-data /usr/src/wordpress

# !!! RIKWORKS CHANGES 2 !!!
# COPY docker-entrypoint.sh /entrypoint.sh

# copy local plugins and themes over to container, and make them usable
COPY ./local-plugins/ /usr/src/wordpress/wp-content/plugins/
RUN chown -R www-data:www-data /usr/src/wordpress/wp-content/plugins
RUN chmod -R 755 /usr/src/wordpress/wp-content/plugins
COPY ./local-themes/ /usr/src/wordpress/wp-content/themes/
RUN chown -R www-data:www-data /usr/src/wordpress/wp-content/themes
RUN chmod -R 755 /usr/src/wordpress/wp-content/themes
COPY ./shellfiles/docker-entrypoint-cohaesus.sh /entrypoint.sh
RUN chmod -R 755 /entrypoint.sh
# !!! ENDS RIKWORKS CHANGES 2 !!!

# grr, ENTRYPOINT resets CMD now
ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
