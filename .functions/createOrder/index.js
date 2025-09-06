
// 创建订单云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const db = cloud.database()
  const { items, userId, address, paymentMethod } = event
  
  try {
    // 计算总价
    let totalAmount = 0
    for (const item of items) {
      const product = await db.collection('product').doc(item.productId).get()
      totalAmount += product.data.price * item.quantity
    }
    
    // 创建订单
    const orderId = Date.now().toString()
    await db.collection('order').add({
      data: {
        orderId,
        userId,
        items,
        totalAmount,
        address,
        paymentMethod,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    // 清空购物车
    for (const item of items) {
      if (item.cartId) {
        await db.collection('shopping_cart').doc(item.cartId).remove()
      }
    }
    
    return {
      success: true,
      orderId
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
