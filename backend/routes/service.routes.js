const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const serviceImageUpload = require('../middlewares/serviceImageUpload');
const serviceController = require('../controllers/service.controller');

// Public routes
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getService);

// Admin routes
router.post('/', auth, authorize('admin'), serviceImageUpload.single('imageFile'), serviceController.createService);
router.put('/:id', auth, authorize('admin'), serviceImageUpload.single('imageFile'), serviceController.updateService);
router.delete('/:id', auth, authorize('admin'), serviceController.deleteService);

module.exports = router;
