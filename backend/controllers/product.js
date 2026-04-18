import Product from '../models/product.js';

/**
 * 商品控制器（product controller）
 * ------------------------------------------------------------------
 * 提供商品 CRUD 接口：
 *  - 读接口（list / detail）任何人都能访问
 *  - 写接口（create / update / delete）在路由层已经加了 authToken + isAdmin
 *    守卫，所以这里不用再判断权限
 */

/**
 * GET /api/products
 * 查询参数（均可选）：
 *   page    页码，默认 1，最小 1
 *   limit   每页条数，默认 6，最大 50（防止一次查太多拖垮数据库）
 *   q       关键词：在 name / description / category 里做不区分大小写的模糊匹配
 *   sort    priceAsc | priceDesc | latest（默认按 createdAt 倒序）
 * 返回结构：{ items, total, page, pages, limit } —— 前端分页直接可用
 */
export const getAllProducts = async (req, res, next) => {
  try {
    // 保护性处理：避免负数/NaN/超大值把 skip/limit 玩坏
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 6, 1),
      50,
    );
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();

    // 关键词为空 → 不加 filter，全量查；否则用正则在三个字段里模糊匹配
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    // 默认按创建时间倒序 —— 让管理员新建的商品出现在列表最前面
    let sort = { createdAt: -1 };
    if (req.query.sort === 'priceAsc') sort = { price: 1 };
    if (req.query.sort === 'priceDesc') sort = { price: -1 };

    // 并行发两个查询：列表 + 总数，省一半等待时间
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

/**
 * GET /api/products/:id
 * 取单个商品详情，找不到就返回 404
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    // 注意：id 格式不合法时 Mongoose 会抛 CastError，
    // 由 errorHandler 统一处理成 400（见 middleware/errorHandler.js）
    next(err);
  }
};

/**
 * POST /api/products
 * 创建商品 —— 仅管理员（路由层 isAdmin 守卫）。
 * 必填字段的校验都在 Schema 里，走不到这里就会抛 ValidationError。
 */
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

/**
 * PUT /api/products/:id
 * 更新商品 —— 仅管理员。
 *
 * 这里刻意选了 "先 findById 再 save" 的写法（而不是 findByIdAndUpdate），
 * 原因：
 *  1. save() 会触发 pre('save') 钩子，保持和创建时一致的数据清洗逻辑
 *  2. save() 会对被修改字段重新跑一遍 Schema 校验
 *     （findByIdAndUpdate 默认不跑校验，除非手动加 runValidators: true）
 *  3. 白名单拷贝字段，防止前端传 isAdmin / _id 等非法字段改脏数据
 */
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

/**
 * DELETE /api/products/:id
 * 删除商品 —— 仅管理员。
 * 用 deleteOne() 而不是 findByIdAndDelete：
 *  - 先 findById 能更清晰地返回 404
 *  - 将来如果要加 pre('remove') 钩子（比如清理购物车里的脏引用），不用改接口
 */
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
