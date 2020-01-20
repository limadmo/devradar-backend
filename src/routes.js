const { Router } = require('express');
const Developers = require('./controllers/Developers');
const SearchController = require('./controllers/SearchController');


const routes = Router();

routes.get('/devs', Developers.index);
routes.post('/devs', Developers.store);
routes.put('/devs', Developers.update);
routes.delete('/devs', Developers.delete);

routes.get('/search', SearchController.index);

module.exports = routes;
