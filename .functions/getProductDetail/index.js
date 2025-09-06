
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const db = cloud.database()
  const { productId } = event
  
  try {
    // 获取商品详情
    const product = await db.collection('product_detail').doc(productId).get()
    
    // 获取商品库存
    const inventory = await db.collection('product_inventory')
      .where({ productId })
      .get()
    
    // 获取商品评价
    const reviews = await db.collection('product_reviews')
      .where({ productId })
      .limit(5)
      .get()
    
    return {
      success: true,
      data: {
        product: product.data,
        inventory: inventory.data,
        reviews: reviews.data
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
