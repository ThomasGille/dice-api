'use strict';

const mongoose = require('mongoose');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const routes = require('./routes');

(async () => {
    const server = await new Hapi.Server({
        port: process.env.PORT || 3000,
        host: 'localhost',
        routes: {
            cors: true
        },
    });
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/test');

    await server.register([
        Inert,
        Vision,
        {
            name: "Hapi-swagger",
            plugin: require('hapi-swagger'),
            options: {
                info: {
                    title: 'Dice API Documentation',
                    version: "0.0",
                }
            }
        }
    ]);

    try {
        routes(server);
        await server.start();
        console.log('Server running at:', server.info.uri);
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
}) ();