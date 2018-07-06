const Joi = require('joi');
const User = require('./models/user.model');
const Monster = require('./models/monster.model');

module.exports = (server) => {
    server.route({
        method: 'GET',
        path: '/',
        handler: async (request, h) => {
            return 'Dice API up and running @ https://api-dice.herokuapp.com/';
        }
    });

    server.route({
        method: 'GET',
        path: '/users',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                User.find(function (err, users) {
                    if (err) console.error(err);
                    reply(users);
                });
            });
        },
        config: {
            description: 'Get all users',
            notes: 'Returns a list of users',
            tags: ['api'], // ADD THIS TAG
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                User.find({
                    _id: request.params.id
                }, function (err, user) {
                    if (err) console.error(err);
                    reply(user);
                });
            });
        },
        config: {
            description: 'Get user by id',
            notes: 'Returns a single user',
            tags: ['api'], // ADD THIS TAG
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
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                const createdUser = new User({ name: request.payload.name, password: request.payload.password });
                createdUser.save().then((kitty) => {reply(kitty)}).catch((e) => {console.log(e)});
            });
        },
        config: {
            description: 'Create user by name and password',
            notes: 'Returns the created user',
            tags: ['api'], // ADD THIS TAG
            validate: {
                payload: {
                    name: Joi.string().min(3).max(20).required(),
                    password: Joi.string().min(3).max(20).required(),
                }
            }
        },
    });

    server.route({
        method: 'DELETE',
        path: '/users/{id}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                User.find({
                    _id: request.params.id
                }, function (err, docs) {
                    docs.forEach((el) => el.remove()); //Remove all the documents that match!
                    reply('User deleted');
                });
            });
        },
        config: {
            description: 'Delete user by id',
            notes: 'Delete a single user',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                }
            }
        },
    });

    server.route({
        method: 'POST',
        path: '/users/{id}/monsters',
        handler: function (request, h) {
            return new Promise((reply, reject) => {
                console.log('ID : ', request.params.id);
                User.find({
                    _id: request.params.id
                }, function (err, docs) {
                    if (err) reject(err);
                    console.log(docs);
                    let user = docs[0];
                    user.monsters.push(new Monster({ name: request.payload.name, health: request.payload.health }));
                    user.save().then((data) => reply(data)).catch((e) => {console.error(e)});
                });
            });
        },
        config: {
            description: 'Add monster to user by idUser',
            notes: 'Returns user',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                },
                payload: {
                    name: Joi.string().min(3).max(20).required(),
                    health: Joi.number().min(1).required(),
                }
            }
        },
    });

    server.route({
        method: 'GET',
        path: '/monsters',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                Monster.find(function (err, users) {
                    if (err) console.error(err);
                    reply(users);
                });
            });
        },
        config: {
            description: 'Get all monsters',
            notes: 'Returns a list of monsters',
            tags: ['api'], // ADD THIS TAG
        }
    });
};