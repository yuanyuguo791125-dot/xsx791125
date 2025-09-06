
# 学习用品商城部署指南

## 项目概述
本项目是一个基于微信小程序的学习用品商城，包含商品展示、购物车、订单管理、拼团活动等功能。

## 技术栈
- 前端：微信小程序原生开发
- 后端：腾讯云开发（CloudBase）
- 数据库：云开发数据库
- 云函数：Node.js

## 部署前准备

### 1. 环境要求
- 微信开发者工具（最新版本）
- 腾讯云账号
- 已开通云开发环境

### 2. 项目结构
```
├── app.json                 # 小程序全局配置
├── app.js                   # 小程序逻辑
├── app.wxss                 # 小程序公共样式表
├── pages/                   # 小程序页面目录
│   ├── home/               # 首页
│   ├── productDetail/      # 商品详情
│   ├── cart/              # 购物车
│   ├── orderList/         # 订单列表
│   ├── orderDetail/       # 订单详情
│   ├── payment/           # 支付页
│   ├── groupList/         # 拼团列表
│   ├── profile/           # 个人中心
│   └── admin/             # 管理后台
├── components/             # 公共组件
├── cloudfunctions/         # 云函数目录
├── .datasources/          # 数据模型定义
└── README.md              # 项目说明
```

## 部署步骤

### 1. 创建云开发环境
1. 登录腾讯云控制台
2. 进入云开发控制台
3. 创建新的云开发环境
4. 记录环境ID（后续配置需要）

### 2. 配置项目
1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 在开发者工具中配置云开发环境ID

### 3. 部署数据库
1. 运行部署脚本：
   ```bash
   node .scripts/deployDatabase.js
   ```
2. 或手动创建以下数据集合：
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

### 4. 部署云函数
1. 在开发者工具中右键点击 `cloudfunctions` 目录
2. 选择"上传并部署：云端安装依赖"
3. 确保以下云函数已部署：
   - getProductDetail
   - updateCart
   - createOrder

## app.json 维护与上传

### app.json 作用
`app.json` 是小程序的全局配置文件，定义了小程序的所有页面路径、窗口表现、网络超时时间、底部 tab 等关键配置。该文件必须位于项目根目录。

### 必需字段说明
```json
{
  "appid": "你的小程序appid",
  "pages": [
    "pages/home/home",
    "pages/productDetail/productDetail",
    "pages/cart/cart",
    "pages/groupList/groupList",
    "pages/orderList/orderList",
    "pages/orderDetail/orderDetail",
    "pages/payment/payment",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "学习用品商城",
    "navigationBarTextStyle": "black"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/home/home",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/groupList/groupList",
        "iconPath": "images/group.png",
        "selectedIconPath": "images/group-active.png",
        "text": "拼团"
      },
      {
        "pagePath": "pages/cart/cart",
        "iconPath": "images/cart.png",
        "selectedIconPath": "images/cart-active.png",
        "text": "购物车"
      },
      {
        "pagePath": "pages/profile/profile",
        "iconPath": "images/profile.png",
        "selectedIconPath": "images/profile-active.png",
        "text": "我的"
      }
    ]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": false
}
```

### 上传 app.json 步骤

#### 步骤1：检查文件存在
确保项目根目录存在 `app.json` 文件：
```
项目根目录/
├── app.json
├── app.js
├── app.wxss
└── pages/
```

#### 步骤2：验证文件格式
1. 使用 JSON 验证工具检查格式
2. 确保所有路径正确（相对于项目根目录）
3. 确认所有引用的图片文件存在

#### 步骤3：上传配置
1. 在微信开发者工具中保存所有文件
2. 点击"上传"按钮
3. 在弹出的窗口中填写版本号和项目备注
4. 点击"上传"完成部署

### 常见问题排查

#### 1. "未找到 app.json" 错误
**原因分析：**
- 文件不在项目根目录
- 文件名拼写错误（如 app.json.txt）
- 项目导入路径错误

**解决方法：**
1. 检查项目根目录是否存在 `app.json`
2. 确认文件名正确（区分大小写）
3. 重新导入项目到开发者工具

#### 2. JSON 格式错误
**常见错误：**
- 缺少逗号或多余逗号
- 引号使用错误（应使用双引号）
- 路径格式错误

**验证方法：**
1. 使用在线 JSON 验证器
2. 开发者工具会自动提示格式错误
3. 检查控制台错误信息

#### 3. 非法字段错误（如 modules）
**错误示例：**
```json
{
  "pages": [...],
  "modules": {...},  // ❌ 非法字段
  "window": {...}
}
```

**正确格式：**
```json
{
  "pages": [...],
  "window": {...},   // ✅ 只包含规范字段
  "tabBar": {...}
}
```

#### 4. 路径错误
**检查要点：**
- 页面路径必须与实际文件路径匹配
- 图片路径必须相对于项目根目录
- tabBar 图标路径必须存在

#### 5. 上传失败
**排查步骤：**
1. 重启微信开发者工具
2. 清除项目缓存（工具 → 清除缓存）
3. 重新导入项目
4. 检查网络连接

### 验证部署成功
1. 在微信开发者工具中预览
2. 检查所有页面能正常加载
3. 验证底部 tab 切换正常
4. 测试云函数调用
5. 检查数据源数据是否正确显示

## 生产环境配置

### 1. 域名配置
在小程序后台配置 request 合法域名：
- https://你的云开发环境ID.service.tcloudbase.com

### 2. 云开发环境
确保生产环境使用正式的云开发环境ID

### 3. 版本管理
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

### 3. 安全设置
- 配置数据库权限
- 设置云函数访问控制
- 定期备份数据

## 技术支持
如遇到问题，请联系：
- 技术邮箱：support@example.com
- 微信：example_support
