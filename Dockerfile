FROM node:14

RUN mkdir /spark

ADD . /spark

WORKDIR /spark

ENV SPARK_DB_USER=spark
ENV SPARK_DB_DATABASE=spark
ENV SPARK_DB_PASSWORD=mysparkpassword
ENV SPARK_DB_HOST=localhost

RUN yarn install && yarn build

CMD [ "yarn", "start" ]
