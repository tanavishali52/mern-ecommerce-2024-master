const express = require('express');
const router = express.Router();
const { deleteBanner } = require('../../controllers/admin/products-controller.js');
const { adminAuth } = require('../../middleware/auth');

// Ensure middleware and controller are properly chained
router.delete('/:id', adminAuth, deleteBanner);

module.exports = router;