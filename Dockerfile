FROM node:14

RUN mkdir /spark

ADD . /spark

WORKDIR /spark

RUN yarn install && yarn build

ENV SPARK_DB_USER=spark
ENV SPARK_DB_DATABASE=spark
ENV SPARK_DB_PASSWORD=mysparkpassword
ENV SPARK_DB_HOST=localhost
ENV NODE_ENV="production"
ENV DATABASE_URL="postgresql://spark:mysparkpassword@localhost:5432/spark"

CMD [ "yarn", "start" ]
