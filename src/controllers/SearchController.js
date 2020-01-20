const DevModel = require('../models/Developers');
const parseStringAsArray = require('../utils/parseStringAsArray');

module.exports = {
  // POST: localhost:3000/devs
  // Status Code: 200 all right and  500 internal error
  async index(req, resp) {
    const {
      latitude, longitude, techs, distance = 50,
    } = req.query;

    try {
      const techsArray = parseStringAsArray(techs);

      const devs = await DevModel.find({
        techs: {
          $in: techsArray,
        },

        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: parseFloat(distance) * 1000,
          },
        },
      });
      resp.json({ devs });
    } catch (error) {
      resp.status(500).json('Internal error'); // Internal error
    }

    return resp.send();
  },
};
