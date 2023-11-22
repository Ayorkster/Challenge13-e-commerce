const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category, Tag],
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [Category, Tag],
    });
    if (!product) {
      return res.status (404).json({error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    // Create the product based on the request body
    const product = await Product.create({
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
    });

    // Check if tagIds are present in the request body
    if (req.body.tagIds && req.body.tagIds.length) {
      // Prepare an array of objects to associate tags with the product
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));

      // Bulk create associations in the ProductTag model
      const productTagIds = await ProductTag.bulkCreate(productTagIdArr);
      
      // Respond with the created product and associated tag IDs
      res.status(200).json({ product, productTagIds });
    } else {
      // If no tags are provided, respond with just the created product
      res.status(200).json(product);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id },
    });
    if (deleted === 1) {
      res.json({ success: 'Category deleted successfully' });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
  // delete one product by its `id` value
});

module.exports = router;
