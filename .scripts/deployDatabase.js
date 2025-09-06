
// 数据库部署脚本
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

async function deployDatabase() {
  console.log('🚀 开始部署数据库...')
  
  // 1. 创建集合
  const collections = [
    'banner',
    'product_category',
    'product',
    'product_detail',
    'product_inventory',
    'shopping_cart',
    'group_activity',
    'order',
    'user_profile',
    'points_history',
    'payment',
    'logistics'
  ]
  
  for (const collection of collections) {
    try {
      await db.createCollection(collection)
      console.log(`✅ 创建集合: ${collection}`)
    } catch (error) {
      console.log(`⚠️ 集合已存在: ${collection}`)
    }
  }
  
  // 2. 创建索引
  const indexes = {
    'product': [
      { field: 'status', type: 'index' },
      { field: 'createdAt', type: 'index' },
      { field: 'price', type: 'index' }
    ],
    'order': [
      { field: 'userId', type: 'index' },
      { field: 'status', type: 'index' },
      { field: 'createdAt', type: 'index' }
    ],
    'shopping_cart': [
      { field: 'userId', type: 'index' },
      { field: 'productId', type: 'index' }
    ]
  }
  
  for (const [collection, indexList] of Object.entries(indexes)) {
    for (const index of indexList) {
      try {
        await db.collection(collection).createIndex({
          [index.field]: index.type
        })
        console.log(`✅ 创建索引: ${collection}.${index.field}`)
      } catch (error) {
        console.log(`⚠️ 索引已存在: ${collection}.${index.field}`)
      }
    }
  }
  
  // 3. 插入初始数据
  await insertInitialData()
  
  console.log('🎉 数据库部署完成')
}

async function insertInitialData() {
  const db = cloud.database()
  
  // 插入banner数据
  const bannerData = [
    {
      title: '新品上市',
      imageUrl: 'https://via.placeholder.com/400x200?text=New+Arrival',
      linkUrl: '/pages/productList',
      status: 'active',
      sortOrder: 1,
      createdAt: new Date()
    },
    {
      title: '限时特惠',
      imageUrl: 'https://via.placeholder.com/400x200?text=Special+Offer',
      linkUrl: '/pages/groupList',
      status: 'active',
      sortOrder: 2,
      createdAt: new Date()
    }
  ]
  
  for (const banner of bannerData) {
    await db.collection('banner').add({ data: banner })
  }
  
  // 插入分类数据
  const categoryData = [
    { name: '热门推荐', icon: '🔥', status: 'active', sortOrder: 1 },
    { name: '新品上市', icon: '✨', status: 'active', sortOrder: 2 },
    { name: '限时特惠', icon: '⏰', status: 'active', sortOrder: 3 },
    { name: '品牌专区', icon: '🏷️', status: 'active', sortOrder: 4 }
  ]
  
  for (const category of categoryData) {
    await db.collection('product_category').add({ data: category })
  }
  
  // 插入商品数据
  const productData = [
    {
      name: '示例商品1',
      price: 99.99,
      originalPrice: 129.99,
      image: 'https://via.placeholder.com/300x300?text=Product+1',
      description: '这是一个示例商品描述',
      status: 'active',
      sales: 100,
      stock: 50,
      createdAt: new Date()
    },
    {
      name: '示例商品2',
      price: 199.99,
      originalPrice: 299.99,
      image: 'https://via.placeholder.com/300x300?text=Product+2',
      description: '这是另一个示例商品描述',
      status: 'active',
      sales: 50,
      stock: 30,
      createdAt: new Date()
    }
  ]
  
  for (const product of productData) {
    await db.collection('product').add({ data: product })
  }
}

// 执行部署
deployDatabase().catch(console.error)
