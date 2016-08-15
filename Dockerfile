FROM phusion/passenger-nodejs:latest

ENV APP_HOME /home/app/crushendo

CMD ["/sbin/my_init"]

EXPOSE 80

WORKDIR $APP_HOME

ADD . $APP_HOME/

RUN chown -R app:app $APP_HOME

RUN npm install

RUN rm /etc/nginx/sites-enabled/default
ADD config/crushendo.nginx.conf /etc/nginx/sites-enabled/crushendo.nginx.conf

RUN rm -f /etc/service/nginx/down

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
