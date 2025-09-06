
# 学习用品商城部署指南

## 项目概述
本项目是一个基于微信小程序的学习用品商城，包含商品展示、购物车、订单管理、拼团活动等功能。

## 技术栈
- 前端：微信小程序原生开发
- 后端：腾讯云开发（CloudBase）
- 数据库：云开发数据库
- 云函数：Node.js

## 项目结构（微信小程序规范）

```
├── app.js                    # 小程序逻辑入口（必需，根目录）
├── app.json                  # 小程序全局配置（必需，根目录）
├── app.wxss                  # 小程序公共样式表（必需，根目录）
├── sitemap.json              # 小程序站点地图（必需，根目录）
├── project.config.json       # 项目配置文件（必需，根目录）
├── pages/                    # 小程序页面目录
│   ├── home/                 # 首页
│   │   ├── home.js           # 页面逻辑
│   │   ├── home.json         # 页面配置
│   │   ├── home.wxml         # 页面结构
│   │   └── home.wxss         # 页面样式
│   ├── productDetail/        # 商品详情页
│   │   ├── productDetail.js
│   │   ├── productDetail.json
│   │   ├── productDetail.wxml
│   │   └── productDetail.wxss
│   ├── cart/                 # 购物车页
│   │   ├── cart.js
│   │   ├── cart.json
│   │   ├── cart.wxml
│   │   └── cart.wxss
│   ├── groupList/            # 拼团列表页
│   │   ├── groupList.js
│   │   ├── groupList.json
│   │   ├── groupList.wxml
│   │   └── groupList.wxss
│   ├── orderList/            # 订单列表页
│   │   ├── orderList.js
│   │   ├── orderList.json
│   │   ├── orderList.wxml
│   │   └── orderList.wxss
│   ├── orderDetail/          # 订单详情页
│   │   ├── orderDetail.js
│   │   ├── orderDetail.json
│   │   ├── orderDetail.wxml
│   │   └── orderDetail.wxss
│   ├── payment/              # 支付页
│   │   ├── payment.js
│   │   ├── payment.json
│   │   ├── payment.wxml
│   │   └── payment.wxss
│   ├── profile/              # 个人中心
│   │   ├── profile.js
│   │   ├── profile.json
│   │   ├── profile.wxml
│   │   └── profile.wxss
│   └── admin/                # 管理后台
│       ├── dashboard/
│       │   ├── dashboard.js
│       │   ├── dashboard.json
│       │   ├── dashboard.wxml
│       │   └── dashboard.wxss
│       └── productList/
│           ├── productList.js
│           ├── productList.json
│           ├── productList.wxml
│           └── productList.wxss
├── components/               # 公共组件
│   ├── TabBar/               # 底部导航组件
│   ├── Carousel/             # 轮播图组件
│   ├── CategoryCard/         # 分类卡片组件
│   ├── ProductCard/          # 商品卡片组件
│   ├── ImageGallery/         # 图片画廊组件
│   ├── ActionBar/            # 操作栏组件
│   ├── GroupCard/            # 拼团卡片组件
│   ├── CategoryFilter/       # 分类筛选组件
│   ├── ProfileHeader/        # 个人中心头部组件
│   ├── FeatureCard/          # 功能卡片组件
│   ├── PointsHistory/        # 积分历史组件
│   ├── CartItem/             # 购物车商品项组件
│   ├── CartSummary/          # 购物车汇总组件
│   ├── OrderCard/            # 订单卡片组件
│   ├── LazyImage/            # 懒加载图片组件
│   ├── SkeletonLoader/       # 骨架屏组件
│   ├── VirtualizedList/      # 虚拟列表组件
│   ├── CartItemCard/         # 购物车商品卡片
│   ├── EmptyCart/            # 空购物车组件
│   ├── PaymentMethodCard/    # 支付方式卡片
│   ├── PointsDeduction/      # 积分抵扣组件
│   └── CountdownTimer/       # 倒计时组件
├── cloudfunctions/           # 云函数目录
│   ├── getProductDetail/     # 获取商品详情
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── updateCart/           # 更新购物车
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── createOrder/          # 创建订单
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   └── getDataSource/        # 通用数据源调用
│       ├── index.js
│       ├── config.json
│       └── package.json
├── .datasources/            # 数据模型定义
│   ├── banner/              # 轮播图数据模型
│   ├── product/             # 商品数据模型
│   ├── product_category/    # 商品分类数据模型
│   ├── product_detail/      # 商品详情数据模型
│   ├── product_inventory/   # 商品库存数据模型
│   ├── shopping_cart/       # 购物车数据模型
│   ├── order/               # 订单数据模型
│   ├── payment/             # 支付记录数据模型
│   ├── group_activity/      # 拼团活动数据模型
│   ├── user_profile/        # 用户资料数据模型
│   ├── points_history/      # 积分历史数据模型
│   └── logistics/           # 物流信息数据模型
├── images/                  # 图片资源目录
│   ├── tab-home.png
│   ├── tab-home-active.png
│   ├── tab-group.png
│   ├── tab-group-active.png
│   ├── tab-cart.png
│   ├── tab-cart-active.png
│   ├── tab-profile.png
│   ├── tab-profile-active.png
│   └── empty.png
├── .scripts/                # 部署脚本
│   └── deployDatabase.js    # 数据库部署脚本
├── README.md                # 项目说明
└── DEPLOYMENT_GUIDE.md      # 部署指南
```

## 部署前准备

### 1. 环境要求
- 微信开发者工具（最新版本）
- 腾讯云账号
- 已开通云开发环境

### 2. 配置项目
1. 克隆项目到本地
2. 使用微信开发者工具打开项目根目录
3. 在开发者工具中配置云开发环境ID（修改 app.js 中的 env 值）

### 3. 部署数据库
运行部署脚本初始化数据：
```bash
node .scripts/deployDatabase.js
```

## 部署步骤

### 步骤1：验证项目结构
确保项目根目录包含以下必需文件：
```
项目根目录/
├── app.js
├── app.json
├── app.wxss
├── sitemap.json
├── project.config.json
└── pages/
    └── home/
        ├── home.js
        ├── home.json
        ├── home.wxml
        └── home.wxss
```

### 步骤2：配置云开发环境
1. 在微信开发者工具中：
   - 点击"云开发"按钮
   - 创建或选择云开发环境
   - 记录环境ID
2. 修改 `app.js` 中的云开发环境配置：
   ```javascript
   wx.cloud.init({
     env: 'your-cloud-env-id', // 替换为你的环境ID
     traceUser: true,
   });
   ```

### 步骤3：部署云函数
1. 在微信开发者工具中：
   - 右键点击 `cloudfunctions` 目录
   - 选择"上传并部署：云端安装依赖"
   - 确保所有云函数部署成功

### 步骤4：初始化数据库
1. 运行部署脚本：
   ```bash
   node .scripts/deployDatabase.js
   ```
2. 或手动创建数据集合：
   - banner（轮播图）
   - product（商品）
   - product_category（商品分类）
   - product_detail（商品详情）
   - product_inventory（商品库存）
   - shopping_cart（购物车）
   - order（订单）
   - payment（支付记录）
   - group_activity（拼团活动）
   - user_profile（用户资料）
   - points_history（积分历史）
   - logistics（物流信息）

### 步骤5：验证部署
1. 在微信开发者工具中点击"预览"
2. 检查所有页面能正常加载
3. 测试云函数调用
4. 验证数据源数据正确显示

## 常见问题排查

### 1. "未找到 app.json" 错误
**原因：** app.json 不在项目根目录
**解决：** 确保 app.json 位于项目根目录，且文件名正确

### 2. "modules is not defined" 错误
**原因：** app.json 中包含非法字段
**解决：** 检查 app.json 只包含微信小程序规范允许的字段

### 3. 页面路径错误
**原因：** pages 配置中的路径与实际文件路径不匹配
**解决：** 确保 app.json 中的 pages 路径与 pages 目录下的实际文件路径一致

### 4. 云函数调用失败
**原因：** 云函数未部署或环境ID配置错误
**解决：** 
1. 确认云函数已部署
2. 检查 app.js 中的云开发环境ID配置
3. 查看云函数日志排查错误

### 5. 数据加载失败
**原因：** 数据集合未创建或权限配置错误
**解决：**
1. 确认数据集合已创建
2. 检查数据库权限设置
3. 验证数据格式是否正确

## 生产环境配置

### 1. 域名配置
在小程序后台配置 request 合法域名：
- https://your-env-id.service.tcloudbase.com

### 2. 版本管理
- 开发版本：用于日常开发测试
- 体验版本：用于内部测试
- 正式版本：用于线上发布

## 监控与维护

### 1. 数据监控
- 定期检查云函数日志
- 监控数据库性能
- 关注用户反馈

### 2. 更新维护
- 定期更新商品数据
- 维护轮播图内容
- 更新拼团活动

## 技术支持
如遇到问题，请检查：
1. 项目结构是否符合微信小程序规范
2. 所有必需文件是否位于根目录
3. 云开发环境是否正确配置
4. 云函数是否成功部署
