FROM cerner/kaiju-ruby-node:2.4.2-8.4.0

# Set env to prod by default
ARG RAILS_ENVIRONMENT=production
ENV RAILS_ENV $RAILS_ENVIRONMENT

# Prepare Directory for Source Code
ENV APP_HOME /app
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

EXPOSE 3000

# Install Ruby Dependencies
COPY Gemfile $APP_HOME/Gemfile
COPY Gemfile.lock $APP_HOME/Gemfile.lock
RUN bundle install

# Install Node Dependencies
ADD client/package.json /tmp/package.json
RUN cd /tmp && npm install --unsafe-perm

# Mount Source into Container
ADD . $App_Home

# Copy cached npm modules into client directory
RUN npm run clean && cp -a /tmp/node_modules $APP_HOME/client

# Cheat, without this folder existing, precompile will fail
RUN mkdir $APP_HOME/app/assets/webpack; exit 0

# Precompile Assets
RUN bundle exec rake assets:precompile

VOLUME ["$APP_HOME/public"]

CMD bundle exec puma
