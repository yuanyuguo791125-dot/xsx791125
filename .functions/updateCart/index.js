
// 购物车更新云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const db = cloud.database()
  const { cartId, quantity, userId } = event
  
  try {
    // 验证用户权限
    const cartItem = await db.collection('shopping_cart').doc(cartId).get()
    if (cartItem.data.userId !== userId) {
      throw new Error('无权限操作')
    }
    
    // 更新数量
    await db.collection('shopping_cart').doc(cartId).update({
      data: {
        quantity,
        updatedAt: new Date()
      }
    })
    
    return {
      success: true,
      message: '更新成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
