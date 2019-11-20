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
    required: true,
  },
  chat_link: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
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
    required: true
  },
  rarity: {
    type: String,
    required: false,
  },
  level: {
    type: Number,
    required: true,
  },
  vendor_value: {
    type: Number,
    required: true,
  },
  default_skin: {
    type: Number,
    required: false,
  },
  flags: {
    type: [String],
    required: true,
  },
  game_types: {
    type: [String],
    required: true,
  },
  restrictions: {
    type: [String],
    required: true,
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
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Item
 */
module.exports = mongoose.model('Item', ItemSchema);
