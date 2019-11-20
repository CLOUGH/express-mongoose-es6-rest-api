const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

/**
 * Item Schema
 */
const ItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false,
  },
  chat_link: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false
  },
  icon: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: false
  },
  rarity: {
    type: String,
    required: false,
  },
  level: {
    type: Number,
    required: false,
  },
  vendor_value: {
    type: Number,
    required: false,
  },
  default_skin: {
    type: Number,
    required: false,
  },
  flags: {
    type: [String],
    required: false,
  },
  game_types: {
    type: [String],
    required: false,
  },
  restrictions: {
    type: [String],
    required: false,
  },
  upgrades_into: {
    type: [mongoose.Schema.Types.Mixed],
    required: false,
  },
  upgrades_from: {
    type: [mongoose.Schema.Types.Mixed],
    required: false,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
}, {
  timestamps: true,
});

ItemSchema.index({ name: 'text', description: 'text' }, { name: 'textSearch', weights: { name: 10, description: 5 } });

ItemSchema.on('index', (err) => {
  if (err) {
    console.error('Item index error: %s', err);
  } else {
    console.info('Item indexing complete');
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
ItemSchema.method({
});

/**
 * Statics
 */
ItemSchema.statics = {
  /**
   * Get item
   * @param {ObjectId} id - The objectId of item.
   * @returns {Promise<Item, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((item) => {
        if (item) {
          return item;
        }
        const err = new APIError('No such item exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List items in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of items to be skipped.
   * @param {number} limit - Limit number of items to be returned.
   * @returns {Promise<Item[]>}
   */
  list({ skip = 0, limit = 50, search } = {}) {
    const natualLanguageQuery = search ? {
      $text: { $search: search }
    } : {};
    return this.find()
      // .sort({ createdAt: -1 })
      .find(natualLanguageQuery)
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Item
 */
module.exports = mongoose.model('Item', ItemSchema);
