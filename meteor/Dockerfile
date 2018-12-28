FROM launcher.gcr.io/google/nodejs
COPY . /app/
RUN (cd programs/server && npm install --unsafe-perm)
CMD node main.js