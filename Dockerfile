FROM node:20.18-alpine

WORKDIR /app

COPY . .
RUN npm install

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5174
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

