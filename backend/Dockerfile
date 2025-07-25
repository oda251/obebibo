FROM ruby:3.2.3

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  nodejs \
  npm \
  curl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs

# Create app directory
WORKDIR /rails

# Copy the application
COPY . .

# Set executable permissions for bin files
RUN chmod +x bin/*

# Create tmp directory for pids
RUN mkdir -p tmp/pids

# Set environment variables
ENV RAILS_ENV=development
ENV RAILS_LOG_TO_STDOUT=true
ENV BUNDLE_SSL_VERIFY_NONE=true

# Expose port
EXPOSE 80

# Set the entrypoint
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start the Rails server
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "80"]