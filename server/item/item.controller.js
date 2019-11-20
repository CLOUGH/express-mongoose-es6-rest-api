const Item = require('./item.model');
const axios = require('axios');

/**
 * Load item and append to req.
 */
function load(req, res, next, id) {
  Item.get(id)
    .then((item) => {
      req.item = item; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

function updateDb(req, res, next) {
  const gw2Api = 'https://api.guildwars2.com/v2';
  // get id's in tp
  axios.get(`${gw2Api}/commerce/listings`).then(({ data: itemIds }) => {
    const itemIdOffset = 0;
    const itemsLimit = 200;
    const currentIds = itemIds.slice(itemIdOffset * itemsLimit, (itemIdOffset + 1) * itemsLimit);
    console.log(currentIds);
    // TODO: loop every 200 item listing till end
    // get the details of the items from the gw2 api
    axios.get(`${gw2Api}/items?ids=${currentIds.join(',')}`)
      .then(({ data: items }) => {
        // update items in  db if the item did not exist
        for (let index = 0; index < items.length; index += 1) {
          const item = new Item(items[index]);
          item.save()
            .then(savedUser => res.json(savedUser))
            .catch(e => next(e));
        }
      })
      .catch(error => next(error));
    // end of loop
  }).catch(error => next(error));

}

/**
 * Get item
 * @returns {Item}
 */
function get(req, res) {
  return res.json(req.item);
}

/**
 * Get item list.
 * @property {number} req.query.skip - Number of items to be skipped.
 * @property {number} req.query.limit - Limit number of items to be returned.
 * @returns {Item[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Item.list({ limit, skip })
    .then(items => res.json(items))
    .catch(e => next(e));
}

module.exports = { load, get, list, updateDb };
