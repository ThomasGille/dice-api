const mongoose = require('mongoose');
const Joi = require('joi');
const Cat = mongoose.model('Cat', { name: String });

'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000, host: '0.0.0.0' });
let dbURI = process.env.MONGODB_URI;
if(!dbURI) {
    dbURI = 'mongodb://localhost/test';
}
mongoose.connect(dbURI);

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        Cat.find(function (err, cats) {
            if (err) return console.error(err);
            reply(cats);
        });
    }
});

server.route({
    method: 'POST',
    path: '/users/{name}',
    handler: function (request, reply) {
        const kitty = new Cat({ name: request.params.name });
        kitty.save().then((kitty) => reply(kitty)).catch((e) => {console.log(e)});
    },
    config: {
        validate: {
            params: {
                name: Joi.string().min(3).max(20)
            }
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/users/{name}',
    handler: function (request, reply) {
        Cat.find({
            name: request.params.name
        }, function (err, docs) {
            docs.forEach((el) => el.remove()); //Remove all the documents that match!
            reply('OK, DELETED!');
        });
    },
    config: {
        validate: {
            params: {
                name: Joi.string().min(3).max(20)
            }
        }
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});