const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: {
        model: Product,
        attributes: ["id", "product_name", "price", "stock", "category_id"],
      }, // Include associated Products
    });
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: {
        model: Product,
        attributes: ["id", "product_name", "price", "stock"],
      }, // Include associated Products
    });
    if (!tag) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.json(newTag);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Tag.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated === 1) {
      res.json({ success: 'Tag updated successfully' });
    } else {
      res.status(404).json({ error: 'Tag not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tag.destroy({
      where: { id: req.params.id },
    });
    if (deleted === 1) {
      res.json({ success: 'Tag deleted successfully' });
    } else {
      res.status(404).json({ error: 'Tag not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
