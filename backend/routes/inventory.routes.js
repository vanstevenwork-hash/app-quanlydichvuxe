const express = require('express');
const { getAllItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/inventory.controller');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Tất cả route inventory đều yêu cầu quyền admin
router.use(auth);
router.use(authorize('admin'));

router
  .route('/')
  .get(getAllItems)
  .post(createItem);

router
  .route('/:id')
  .get(getItem)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
