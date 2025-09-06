
// pages/home/home.js
const app = getApp()

Page({
  data: {
    banners: [],
    categories: [],
    hotProducts: [],
    newProducts: [],
    products: [],
    loading: true,
    hasMore: true,
    page: 1
  },

  onLoad() {
    this.loadHomeData()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true
    })
    this.loadHomeData(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProducts()
    }
  },

  loadHomeData(callback) {
    wx.showLoading({
      title: '加载中...'
    })
    
    Promise.all([
      this.loadBanners(),
      this.loadCategories(),
      this.loadHotProducts(),
      this.loadNewProducts(),
      this.loadProducts(1, true)
    ]).then(() => {
      this.setData({ loading: false })
      wx.hideLoading()
      callback && callback()
    }).catch(err => {
      console.error('加载首页数据失败:', err)
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
      callback && callback()
    })
  },

  loadBanners() {
    return wx.cloud.callFunction({
      name: 'getDataSource',
      data: {
        dataSourceName: 'banner',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: { $eq: 'active' }
            }
          },
          orderBy: [{ sort_order: 'asc' }],
          select: { $master: true }
        }
      }
    }).then(res => {
      this.setData({
        banners: res.result.records || []
      })
    })
  },

  loadCategories() {
    return wx.cloud.callFunction({
      name: 'getDataSource',
      data: {
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_active: { $eq: true },
              level: { $eq: 1 }
            }
          },
          orderBy: [{ sort_order: 'asc' }],
          select: { $master: true }
        }
      }
    }).then(res => {
      this.setData({
        categories: res.result.records || []
      })
    })
  },

  loadHotProducts() {
    return wx.cloud.callFunction({
      name: 'getDataSource',
      data: {
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_hot: { $eq: true },
              status: { $eq: 'active' }
            }
          },
          orderBy: [{ sales: 'desc' }],
          pageSize: 6,
          select: { $master: true }
        }
      }
    }).then(res => {
      this.setData({
        hotProducts: res.result.records || []
      })
    })
  },

  loadNewProducts() {
    return wx.cloud.callFunction({
      name: 'getDataSource',
      data: {
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_new: { $eq: true },
              status: { $eq: 'active' }
            }
          },
          orderBy: [{ createdAt: 'desc' }],
          pageSize: 6,
          select: { $master: true }
        }
      }
    }).then(res => {
      this.setData({
        newProducts: res.result.records || []
      })
    })
  },

  loadProducts(page = 1, refresh = false) {
    return wx.cloud.callFunction({
      name: 'getDataSource',
      data: {
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: { $eq: 'active' }
            }
          },
          orderBy: [{ sales: 'desc' }],
          pageSize: 10,
          pageNumber: page,
          select: { $master: true }
        }
      }
    }).then(res => {
      const newProducts = res.result.records || []
      const hasMore = newProducts.length === 10
      
      if (refresh) {
        this.setData({
          products: newProducts,
          page: 1,
          hasMore
        })
      } else {
        this.setData({
          products: [...this.data.products, ...newProducts],
          page,
          hasMore
        })
      }
    })
  },

  loadMoreProducts() {
    this.setData({ loading: true })
    this.loadProducts(this.data.page + 1).then(() => {
      this.setData({ loading: false })
    }).catch(err => {
      console.error('加载更多商品失败:', err)
      this.setData({ loading: false })
    })
  },

  onBannerTap(e) {
    const { banner } = e.currentTarget.dataset
    if (banner.link_url) {
      wx.navigateTo({
        url: `/${banner.link_url}`
      })
    }
  },

  onCategoryTap(e) {
    const { category } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/category/category?categoryId=${category._id}`
    })
  },

  onProductTap(e) {
    const { product } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/productDetail/productDetail?productId=${product._id}`
    })
  },

  onSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  }
})
