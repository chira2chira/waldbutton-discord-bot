FROM jrottenberg/ffmpeg:4.4-alpine AS ffmpeg
FROM node:lts-alpine

COPY --from=ffmpeg / /
WORKDIR /app
COPY . .
RUN yarn

ARG PORT
EXPOSE ${PORT:-3000}

CMD ["yarn", "start"]