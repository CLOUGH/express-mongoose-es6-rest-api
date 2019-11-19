const express = require('express');
const itemCtrl = require('./item.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/users - Get list of users */
  .get(itemCtrl.list);

router.route('/:itemId')
  /** GET /api/users/:itemId - Get user */
  .get(itemCtrl.get);

/** Load user when API with itemId route parameter is hit */
router.param('itemId', itemCtrl.load);

module.exports = router;
