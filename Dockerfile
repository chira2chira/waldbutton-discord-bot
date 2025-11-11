FROM node:lts-alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache make gcc g++ python3 tzdata ffmpeg && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    apk del tzdata

WORKDIR /app
COPY . .
RUN yarn

ARG PORT
EXPOSE ${PORT:-3000}

CMD ["yarn", "start"]