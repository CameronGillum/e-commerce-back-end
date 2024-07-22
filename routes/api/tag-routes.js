const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  Tag.findAll({
    include: [
      {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
      }
    ]
  })
    .then((tagData) => res.json(tagData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  Tag.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
      }
    ]
  })
    .then((tagData) => res.json(tagData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/', async (req, res) => {
  // create a new tag
  // req.body should look like this...
  // {
  //   "tag_name": "Basketball",
  //   "productIds": [1, 2, 3, 4]
  // }
  try {
    const { tag_name, productIds } = req.body;

    // Create the new tag
    const tag = await Tag.create({ tag_name });

    // Validate product IDs
    if (productIds && productIds.length) {
      const validProductIds = await Product.findAll({
        where: { id: productIds },
        attributes: ['id']
      });

      const validIds = validProductIds.map(product => product.id);
      const invalidIds = productIds.filter(id => !validIds.includes(id));

      if (invalidIds.length) {
        return res.status(400).json({ message: `Invalid product IDs: ${invalidIds.join(', ')}` });
      }

      const tagProductIdArr = productIds.map(product_id => ({
        tag_id: tag.id,
        product_id,
      }));

      await ProductTag.bulkCreate(tagProductIdArr);
    }

    res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: { id: req.params.id }
  })
    .then((tag) => res.json(tag))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
    where: { id: req.params.id }
  })
    .then((tag) => res.json(tag))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});


module.exports = router;
