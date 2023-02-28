FROM node:16.19-alpine3.16

# Set the working directory
WORKDIR /usr/src/app

# Get the models and build each
COPY . .

# Install dependencies, build app, and serve
WORKDIR /usr/src/app/payment-service
RUN npm cache clean --force && rm -rf node_modules && npm install
RUN npm uninstall tsc
RUN npm uninstall -g typescript
RUN npm install -g typescript

# Expose port
EXPOSE 3002

# Start the server
CMD ["npm", "run", "start:dev"]
