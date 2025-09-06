
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, productId, quantity, sku } = event
  const openid = wxContext.OPENID

  if (!productId) return { success: false, error: '缺少商品ID' }

  const db = cloud.database()
  const _ = db.command

  try {
    switch (action) {
      case 'add': {
        // 检查商品是否存在
        const product = await db.collection('product').doc(productId).get()
        if (!product.data) return { success: false, error: '商品不存在' }

        // 检查购物车是否已有该商品
        const exist = await db.collection('shopping_cart')
          .where({ openid, product_id: productId, sku: sku || '' })
          .get()

        if (exist.data.length) {
          // 更新数量
          await db.collection('shopping_cart').doc(exist.data[0]._id).update({
            data: {
              quantity: _.inc(quantity || 1),
              updated_at: new Date()
            }
          })
        } else {
          // 新增
          await db.collection('shopping_cart').add({
            data: {
              openid,
              product_id: productId,
              quantity: quantity || 1,
              sku: sku || '',
              created_at: new Date(),
              updated_at: new Date()
            }
          })
        }
        return { success: true, message: '已加入购物车' }
      }

      case 'update': {
        if (quantity <= 0) {
          // 删除
          await db.collection('shopping_cart')
            .where({ openid, product_id: productId, sku: sku || '' })
            .remove()
          return { success: true, message: '已移除商品' }
        } else {
          // 更新数量
          await db.collection('shopping_cart')
            .where({ openid, product_id: productId, sku: sku || '' })
            .update({
              data: {
                quantity,
                updated_at: new Date()
              }
            })
          return { success: true, message: '已更新数量' }
        }
      }

      case 'clear': {
        await db.collection('shopping_cart').where({ openid }).remove()
        return { success: true, message: '购物车已清空' }
      }

      case 'list': {
        const cart = await db.collection('shopping_cart')
          .where({ openid })
          .get()
        return { success: true, data: cart.data }
      }

      default:
        return { success: false, error: '无效的操作' }
    }
  } catch (err) {
    console.error('updateCart error:', err)
    return { success: false, error: err.message }
  }
}
  