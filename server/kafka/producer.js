import Kafka from 'node-rdkafka';
require('dotenv').config();


const broker_url = process.env.BROKER_URL;
const stream = Kafka.Producer.createWriteStream({
    'metadata.broker.list': broker_url
});

module.exports = kafkaProducer;
