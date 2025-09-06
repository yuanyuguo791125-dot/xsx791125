
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { productId } = event
  if (!productId) return { success: false, error: '缺少商品ID' }

  const db = cloud.database()
  try {
    // 1. 商品基本信息
    const productRes = await db.collection('product')
      .where({ _id: productId, status: 'active' })
      .get()
    if (!productRes.data.length) return { success: false, error: '商品不存在' }
    const product = productRes.data[0]

    // 2. 商品详情
    const detailRes = await db.collection('product_detail')
      .where({ product_id: productId })
      .get()
    const detail = detailRes.data[0] || {}

    // 3. 库存
    const inventoryRes = await db.collection('product_inventory')
      .where({ product_id: productId })
      .get()
    const inventory = inventoryRes.data[0] || { stock: 0 }

    // 4. 拼团活动
    const groupRes = await db.collection('group_activity')
      .where({
        product_id: productId,
        status: 'active',
        end_time: db.command.gt(new Date())
      })
      .get()
    const groupActivity = groupRes.data[0] || null

    return {
      success: true,
      data: {
        product,
        detail,
        inventory,
        groupActivity
      }
    }
  } catch (err) {
    console.error('getProductDetail error:', err)
    return { success: false, error: err.message }
  }
}
  