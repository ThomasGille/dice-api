const Joi = require('joi');
const mongoose = require('mongoose');

const User = require('./models/user.model');
const Monster = require('./models/monster.model');
const Dice = require('./models/dice.model');
const Game = require('./models/game.model');
const defaultMonsterPictureLink = 'https://vignette1.wikia.nocookie.net/geometry-dash/images/d/d3/Icon_%2831%29.png/revision/latest/scale-to-width-down/185?cb=20151215043127&path-prefix=es';

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
                User.find().populate('monsters')
                .exec(function (err, users) {
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
                createdUser.save().then((kitty) => {reply(kitty)}).catch((e) => {console.error(e)});
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
                User.find({
                    _id: request.params.id
                }, function (err, docs) {
                    if (err) reject(err);
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

    ////////////////////////////////////////////////////////////////
    ////////////////////////// MONSTER ROUTES /////////////////////////
    ////////////////////////////////////////////////////////////////

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

    server.route({
        method: 'GET',
        path: '/monsters/{id}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                Monster.findOne({
                    _id: request.params.id
                }).populate('_dices')
                .exec(function (err, monster) {
                    if (err) console.error(err);
                    reply(monster);
                });
            });
        },
        config: {
            description: 'Get monster by id',
            notes: 'Returns a single monster with dices populated',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                }
            }
        }
    });

    server.route({
        method: 'PUT',
        path: '/monsters/{id}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                payload = request.payload;
                updatePayload = {
                    'name': payload.name,
                    'health': payload.health,
                    'x': payload.x,
                    'y': payload.y,
                }
                if (payload.pictureLink) {
                    updatePayload.pictureLink = payload.pictureLink;
                }
                Monster.findOneAndUpdate({_id: request.params.id}, updatePayload, {new:true} , function(err, doc) {
                    if(err) reject(err);
                    else reply(doc);
                });
            });
        },
        config: {
            description: 'Update a monster',
            notes: 'Returns the monster',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                },
                payload: {
                    name: Joi.string().min(1).required(),
                    health: Joi.number().min(1).required(),
                    x: Joi.number().min(0).required(),
                    y: Joi.number().min(0).required(),
                    pictureLink: Joi.string().allow(null),
                }
            }
        }
    });

    ////////////////////////////////////////////////////////////////
    ////////////////////////// DICE ROUTES /////////////////////////
    ////////////////////////////////////////////////////////////////

    server.route({
        method: 'GET',
        path: '/dices',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                Dice.find(function (err, users) {
                    if (err) console.error(err);
                    reply(users);
                });
            });
        },
        config: {
            description: 'Get all dices',
            notes: 'Returns a list of dice',
            tags: ['api'], // ADD THIS TAG
        }
    });

    server.route({
        method: 'PUT',
        path: '/dices/{id}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                payload = request.payload;
                updatePayload =  {
                    'name': payload.name,
                    'number': payload.number,
                    'type': payload.type,
                    'bonus': payload.bonus,
                }
                if (payload.objective) {
                    updatePayload.objective = payload.objective;
                }
                Dice.findOneAndUpdate({_id: request.params.id}, updatePayload, {new:true} , function(err, doc) {
                    if(err) reject(err);
                    else reply(doc);
                });
            });
        },
        config: {
            description: 'Update a dice',
            notes: 'Returns the dice',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                },
                payload: {
                    name: Joi.string().required(),
                    number: Joi.number().min(1).required(),
                    type: Joi.number().required().valid([2,3,4,6,8,10,12,20,100]),
                    bonus: Joi.number().required(),
                    objective : Joi.number().min(1).allow(null),
                }
            }
        }
    });

    ////////////////////////////////////////////////////////////////
    ////////////////////////// GAME ROUTES /////////////////////////
    ////////////////////////////////////////////////////////////////

    server.route({
        method: 'GET',
        path: '/games',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                Game.find()
                .exec(function (err, games) {
                    if (err) console.error(err);
                    reply(games);
                });
            });
        },
        config: {
            description: 'Get all games',
            notes: 'Returns a list of games',
            tags: ['api'], // ADD THIS TAG
        }
    });

    server.route({
        method: 'GET',
        path: '/games/{id}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                Game.findOne({
                    _id: request.params.id
                }).populate('_dices')
                .populate('_monsters')
                .exec(function (err, game) {
                    if (err) console.error(err);
                    reply(game);
                });
            });
        },
        config: {
            description: 'Get game by id',
            notes: 'Returns a single game with dices & monsters populated',
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
        path: '/games',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                const createdGame = new Game({ name: request.payload.name });
                createdGame.save().then((game) => {reply(game)}).catch((e) => {console.error(e)});
            });
        },
        config: {
            description: 'Create game by name',
            notes: 'Returns the created game',
            tags: ['api'], // ADD THIS TAG
            validate: {
                payload: {
                    name: Joi.string().min(3).max(20).required(),
                }
            }
        },
    });

    server.route({
        method: 'DELETE',
        path: '/games/{id}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                Game.find({
                    _id: request.params.id
                }, function (err, docs) {
                    docs.forEach((el) => el.remove()); //Remove all the documents that match!
                    reply(JSON.stringify(`Game ${request.params.id} deleted`));
                });
            });
        },
        config: {
            description: 'Delete game by id',
            notes: 'Delete a game',
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
        path: '/games/{id}/monsters',
        handler: function (request, h) {
            return new Promise((reply, reject) => {
                payload = request.payload;
                let addedMonster = new Monster({
                    'name': payload.name,
                    'health': payload.health,
                    'x': payload.x,
                    'y': payload.y,
                    'pictureLink': payload.pictureLink ? payload.pictureLink : defaultMonsterPictureLink,
                });

                addedMonster.save(function(err, monster) {
                  Game.findById(request.params.id, function(err, game) {
                    game._monsters.push(addedMonster);
                    game.save(function(err, savedGame) {
                      if(err) reject(err);
                      else reply(addedMonster);
                    });
                  });
                });
            });
        },
        config: {
            description: 'Add monster to game',
            notes: 'Returns game',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                },
                payload: {
                    name: Joi.string().min(1).required(),
                    health: Joi.number().min(1).required(),
                    x: Joi.number().min(0).required(),
                    y: Joi.number().min(0).required(),
                    pictureLink: Joi.string(),
                }
            }
        },
    });

    server.route({
        method: 'DELETE',
        path: '/games/{id}/monsters/{monsterId}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                Game.findOne({
                    _id: request.params.id
                }).populate('_monsters')
                .exec(function (err, game) {
                    if (err) console.error(err);
                    game._monsters.remove({_id: request.params.monsterId})
                    game.save();
                    reply(game);
                });
            });
        },
        config: {
            description: 'Remove a monster from a game',
            notes: 'Returns a single game with monsters populated',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                    monsterId: Joi.string().required(),
                }
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/games/{id}/dices',
        handler: function (request, h) {
            return new Promise((reply, reject) => {

                let addedDice = new Dice({
                    name: request.payload.name,
                    number: request.payload.number,
                    type: request.payload.type,
                    bonus: request.payload.bonus,
                });

                addedDice.save(function(err, dice) {
                  Game.findById(request.params.id, function(err, game) {
                    game._dices.push(addedDice);
                    game.save(function(err, savedGame) {
                      if(err) reject(err);
                      else reply(addedDice);
                    });
                  });
                });
            });
        },
        config: {
            description: 'Add dice to game',
            notes: 'Returns game',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                },
                payload: {
                    name: Joi.string().required(),
                    number: Joi.number().min(1).required(),
                    type: Joi.number().required().valid([2,3,4,6,8,10,12,20,100]),
                    bonus: Joi.number().required(),
                }
            }
        },
    });

    server.route({
        method: 'DELETE',
        path: '/games/{id}/dices/{diceId}',
        handler: async (request, h) => {
            return new Promise((reply, reject) => {
                Game.findOne({
                    _id: request.params.id
                }).populate('_dices')
                .exec(function (err, game) {
                    if (err) console.error(err);
                    game._dices.remove({_id: request.params.diceId})
                    game.save();
                    reply(game);
                });
            });
        },
        config: {
            description: 'Remove a dice from a game',
            notes: 'Returns a single game with dices populated',
            tags: ['api'], // ADD THIS TAG
            validate: {
                params: {
                    id: Joi.string().required(),
                    diceId: Joi.string().required(),
                }
            }
        }
    });
};
