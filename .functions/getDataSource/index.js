
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const { dataSourceName, methodName, params = {} } = event
    
    if (!dataSourceName || !methodName) {
      return {
        success: false,
        error: '缺少必需参数：dataSourceName 和 methodName'
      }
    }
    
    const db = cloud.database()
    
    // 根据方法名调用对应的数据源方法
    let result
    switch (methodName) {
      case 'wedaGetRecordsV2':
        result = await db.collection(dataSourceName)
          .where(params.filter?.where || {})
          .orderBy(params.orderBy?.[0] || {})
          .limit(params.pageSize || 20)
          .skip((params.pageNumber - 1) * (params.pageSize || 20))
          .get()
        return {
          success: true,
          records: result.data,
          total: result.data.length
        }
        
      case 'wedaGetItemV2':
        result = await db.collection(dataSourceName)
          .where(params.filter?.where || {})
          .get()
        return {
          success: true,
          data: result.data[0] || null
        }
        
      case 'wedaCreateV2':
        const createResult = await db.collection(dataSourceName)
          .add({
            data: {
              ...params.data,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        return {
          success: true,
          id: createResult._id
        }
        
      case 'wedaUpdateV2':
        const updateResult = await db.collection(dataSourceName)
          .where(params.filter?.where || {})
          .update({
            data: {
              ...params.data,
              updatedAt: new Date()
            }
          })
        return {
          success: true,
          count: updateResult.stats.updated
        }
        
      case 'wedaDeleteV2':
        const deleteResult = await db.collection(dataSourceName)
          .where(params.filter?.where || {})
          .remove()
        return {
          success: true,
          count: deleteResult.stats.removed
        }
        
      default:
        return {
          success: false,
          error: `不支持的方法：${methodName}`
        }
    }
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
