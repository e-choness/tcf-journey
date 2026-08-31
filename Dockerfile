FROM ruby:3.2-slim

WORKDIR /site

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy Gemfile
COPY Gemfile Gemfile.lock* ./

# Install gems
RUN bundle install

# Copy site
COPY . .

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--config", "_config/_config_dev.yml"]
