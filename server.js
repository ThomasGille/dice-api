const mongoose = require('mongoose');
const Joi = require('joi');
const User = mongoose.model('User', { name: String, password: String });

'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000, host: '0.0.0.0' });
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/test');

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Dice API up and running @ https://api-dice.herokuapp.com/')
    }
});

server.route({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {
        User.find(function (err, users) {
            if (err) return console.error(err);
            reply(users);
        });
    }
});

server.route({
    method: 'GET',
    path: '/users/{id}',
    handler: function (request, reply) {
        User.find({
            _id: request.params.id
        }, function (err, docs) {
            reply(docs);
        });
    },
    config: {
        validate: {
            params: {
                id: Joi.string().required(),
            }
        }
    }
});

server.route({
    method: 'POST',
    path: '/users/',
    handler: function (request, reply) {
        const kitty = new User({ name: request.payload.name, password: request.payload.password });
        kitty.save().then((kitty) => reply(kitty)).catch((e) => {console.log(e)});
    },
    config: {
        validate: {
            payload: {
                name: Joi.string().min(3).max(20).required(),
                password: Joi.string().min(3).max(20).required(),
            }
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/users/{id}',
    handler: function (request, reply) {
        User.find({
            _id: request.params.id
        }, function (err, docs) {
            docs.forEach((el) => el.remove()); //Remove all the documents that match!
            reply().code(200);
        });
    },
    config: {
        validate: {
            params: {
                id: Joi.string().required(),
            }
        }
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('API is up and running')
});