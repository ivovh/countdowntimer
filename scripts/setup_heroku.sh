#!/usr/bin/env bash
heroku config:set NODE_ENV=production
heroku config:set NPM_CONFIG_PRODUCTION=true

# create local cert with
sudo certbot certonly --manual

# upload to Heroku using
sudo heroku _certs:add /etc/letsencrypt/live/www.countdowntimer.se/fullchain.pem /etc/letsencrypt/live/www.countdowntimer.se/privkey.pem
