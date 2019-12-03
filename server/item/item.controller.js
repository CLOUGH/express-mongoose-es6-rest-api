const Item = require('./item.model');
const axios = require('axios');
// const moment = require('moment');

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
  axios.get(`${gw2Api}/commerce/listings`).then(({ data: itemIds, headers }) => {
    Item
      .find()
      .select('id')
      .exec()
      .then((dbItemIds) => {
        // filter items already being tracked
        const itemsLimit = 200;
        const requestDelay = (60 * 1000) / Math.floor(headers['x-rate-limit-limit'] * 0.8);
        console.log({ requestDelay });
        const filterItemIds = itemIds
          .filter(itemId => dbItemIds.findIndex(dbItemId => dbItemId.id === itemId) === -1);
        const numberOfLoops = Math.floor(filterItemIds.length / itemsLimit)
          + (filterItemIds.length % itemsLimit > 0 ? 1 : 0);

        // TODO: loop every 200 item listing till end
        const promises = [];
        Array(numberOfLoops).fill(0).forEach((loop, currentOffset) => {
          const offsetIds = itemIds.slice(
            currentOffset * itemsLimit,
            (currentOffset + 1) * itemsLimit
          );

          // get the details of the items from the gw2 api
          const promise = new Promise((resolve) => {
            setTimeout(() => {
              const getItemsPromise = axios.get(`${gw2Api}/items?ids=${offsetIds.join(',')}`)
                .then(({ data: items }) =>
                  Item // update items in  db if the item did not exist
                    .bulkWrite(items.map(item => ({
                      updateOne: {
                        filter: { id: item.id },
                        update: {
                          $set: item
                        },
                        upsert: true
                      }
                    })))
                    .then((value) => {
                      console.log(`updated batch: ${(currentOffset + 1) * itemsLimit} of ${filterItemIds.length}`);
                      return value;
                    })
                    .catch(err => console.error(err))
                )
                .catch(error => console.error(error));
              return resolve(getItemsPromise);
            }, requestDelay * currentOffset);
          });

          promises.push(promise);
        });

        Promise.all(promises)
          .then((bulkOperations) => {
            Item.syncIndexes();
            console.log(bulkOperations);
          })
          .catch(err => console.log(err));
        res.json({ message: 'batch process is running' });
        // end of loop
      })
      .catch(err => next(err));
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
  const { limit = 50, page = 1, search } = req.query;
  console.log(req.query);

  const nlQuery = search ? {
    $and: [
      {
        $or: [
          { $text: { $search: search } },
          // { name: { $regex: search, $options: 'i' } }
        ]
      }
    ]
  } : {};
  Item.paginate(nlQuery, { limit: +limit, page: +page })
    .then((result) => {
      res.set('X-LENGTH', result.total)
        .set('X-LIMIT', result.limit)
        .set('X-PAGE', result.page)
        .set('X-PAGES', result.pages)
        .json(result.docs);
    })
    .catch(e => next(e));
}

module.exports = { load, get, list, updateDb };
