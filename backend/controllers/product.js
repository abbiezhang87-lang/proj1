import Product from '../models/product.js';
export const getAllProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50,
    );
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    let sort = { createdAt: -1 };
    if (req.query.sort === 'priceAsc') sort = { price: 1 };
    if (req.query.sort === 'priceDesc') sort = { price: -1 };

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1, // 至少返回 1 页，避免前端出现 0 页
      limit,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, inStockQuantity, imageUrl } =
      req.body;

    const product = await Product.create({
      name,
      description,
      category,
      price,
      inStockQuantity,
      imageUrl,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 白名单，只允许这些字段被 PATCH
    const fields = [
      'name',
      'description',
      'category',
      'price',
      'inStockQuantity',
      'imageUrl',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    const updated = await product.save();
    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (err) {
    next(err);
  }
};
