
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { items, address, paymentMethod, usePoints = 0 } = event
  const openid = wxContext.OPENID

  if (!items || !items.length) return { success: false, error: '商品不能为空' }
  if (!address) return { success: false, error: '收货地址不能为空' }

  const db = cloud.database()
  const _ = db.command
  const transaction = await db.startTransaction()

  try {
    // 1. 计算订单金额
    let totalAmount = 0
    let totalQuantity = 0
    const orderItems = []

    for (const item of items) {
      const product = await transaction.collection('product').doc(item.productId).get()
      if (!product.data) throw new Error(`商品 ${item.productId} 不存在`)
      if (product.data.stock < item.quantity) throw new Error(`商品 ${product.data.name} 库存不足`)

      const itemAmount = product.data.price * item.quantity
      totalAmount += itemAmount
      totalQuantity += item.quantity

      orderItems.push({
        product_id: item.productId,
        name: product.data.name,
        image: product.data.main_image,
        price: product.data.price,
        quantity: item.quantity,
        sku: item.sku || ''
      })
    }

    // 2. 积分抵扣
    let finalAmount = totalAmount
    if (usePoints > 0) {
      const user = await transaction.collection('user_profile').where({ openid }).get()
      if (!user.data.length || user.data[0].points < usePoints) {
        throw new Error('积分不足')
      }
      const deduction = Math.min(usePoints / 100, totalAmount) // 100积分=1元
      finalAmount = Math.max(totalAmount - deduction, 0)
    }

    // 3. 创建订单
    const orderNo = `ORD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const order = {
      order_no: orderNo,
      openid,
      items: orderItems,
      total_amount: totalAmount,
      final_amount: finalAmount,
      use_points: usePoints,
      address,
      payment_method: paymentMethod,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    }

    const orderRes = await transaction.collection('order').add({ data: order })

    // 4. 扣减库存
    for (const item of items) {
      await transaction.collection('product_inventory')
        .where({ product_id: item.productId })
        .update({
          data: {
            stock: _.inc(-item.quantity),
            sales: _.inc(item.quantity)
          }
        })
    }

    // 5. 清空购物车
    await transaction.collection('shopping_cart').where({ openid }).remove()

    await transaction.commit()

    return {
      success: true,
      data: {
        orderId: orderRes._id,
        orderNo,
        totalAmount,
        finalAmount
      }
    }
  } catch (err) {
    await transaction.rollback()
    console.error('createOrder error:', err)
    return { success: false, error: err.message }
  }
}
  