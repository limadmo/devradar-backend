const axios = require('axios');
const developers = require('../models/Developers');
const parseStringAsArray = require('../utils/parseStringAsArray');

module.exports = {
  async index(req, resp) {
    const devs = await developers.find();

    return resp.json(devs).send();
  },

  // POST: localhost:3000/devs
  // Status Code: 200 dev already exists, 201 dev created, 400 required and 500 error
  async store(req, resp) {
    let dev;
    resp.status(200); // expected status if dev already exists


    try {
      const {
        githubUsername, techs, latitude, longitude,
      } = req.query;

      const errorMsg = [];
      if (!githubUsername) {
        errorMsg.push('githubUsername');
      }
      if (!techs) {
        errorMsg.push('techs');
      }
      if (!latitude) {
        errorMsg.push('latitude');
      }
      if (!longitude) {
        errorMsg.push('longitude');
      }
      if (errorMsg.length) throw new SyntaxError(errorMsg);


      dev = await developers.findOne({ githubUsername });
      if (!dev) {
        const techsArray = parseStringAsArray(techs);
        const apiResponse = await axios.get(
          `https://api.github.com/users/${githubUsername}`,
        );
        // eslint-disable-next-line no-undef
        const {
          name, login, avatarUrl, bio,
        } = apiResponse.data;

        const location = {
          type: 'Point',
          coordinates: [longitude, latitude],
        };
        dev = await developers.create({
          githubUsername,
          name: name || login,
          avatarUrl,
          bio,
          techs: techsArray,
          location,
        });
        resp.status(201); // Developer Created
      } else {
        resp.json({ message: 'developer already exists' }).json({ message: 'developer created' });
      }
    } catch (error) {
      if (error.name === 'SyntaxError') resp.status(400).json({ required: error.message }); // Required field
      else resp.status(500).json('Internal error'); // Internal error
    }

    return resp.send();
  },

  // PUT: localhost:3000/devs
  // Status Code: 200 dev updated, 400 required params, 404 dev not found and 500 error
  async update(req, resp) {
    let dev;
    resp.status(200); // expected status if dev updated

    try {
      const {
        githubUsername, techs, latitude, longitude, name, bio, avatarUrl,
      } = req.query;
      const errorMsg = [];
      const updateQuery = {};

      let techsArray;

      if (!githubUsername) {
        errorMsg.push('githubUsername');
        throw new SyntaxError(errorMsg); // required
      }
      dev = await developers.findOne({ githubUsername });
      if (dev) {
        if (longitude) {
          if (!latitude) {
            errorMsg.push('longitude');
          }
        }

        if (latitude) {
          if (!longitude) {
            errorMsg.push('latitude');
          }
        }
        if (errorMsg.length) throw new SyntaxError(errorMsg);
        if (latitude && longitude) {
          const location = {
            type: 'Point',
            coordinates: [longitude, latitude],
          };
          updateQuery.location = location;
        }

        if (techs) {
          techsArray = parseStringAsArray(techs);
          updateQuery.techs = techsArray;
        }
        if (name) {
          updateQuery.name = name;
        }
        if (bio) {
          updateQuery.bio = bio;
        }
        if (avatarUrl) {
          updateQuery.avatarUrl = avatarUrl;
        }

        dev = await dev.updateOne(updateQuery);
        resp.json({ message: 'developer updated' }); // Expected
      } else {
        resp.status(404).json({ message: 'developer not found' });
      }
    } catch (error) {
      if (error.name === 'SyntaxError') {
        resp.status(400).json({ required: error.message }); // Required field
      } else {
        resp.status(500).json('Internal error'); // Internal error
      }
    }
    return resp.send();
  },

  // DELETE: localhost:3000/devs
  // Status Code: 200 dev deleted, 400 required params, 404 dev not found and 500 error
  async delete(req, resp) {
    let dev;
    resp.status(200); // expected status if dev deleted

    try {
      const { githubUsername } = req.query;

      const errorMsg = [];
      if (!githubUsername) {
        errorMsg.push('githubUsername');
        throw new SyntaxError(errorMsg);
      }

      dev = await developers.findOne({ githubUsername });
      if (dev) {
        developers.findOneAndDelete({ githubUsername }).exec();
        resp.json({ message: 'developer deleted' });
      } else {
        resp.status(404).json({ message: 'developer not found' });
      }
    } catch (error) {
      if (error.name === 'SyntaxError') {
        resp.status(400).json({ required: error.message }); // Required field
      } else {
        resp.status(500).json('Internal error'); // Internal error }
      }
    }
    return resp.send(); // Expected
  },
};
