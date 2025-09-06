
# 电商小程序完整部署指南

## 1. 环境准备

### 1.1 注册云开发环境
1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 创建云开发环境
3. 记录环境ID

### 1.2 安装开发工具
```bash
# 安装微信开发者工具
# 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

# 安装云开发CLI
npm install -g @cloudbase/cli
```

## 2. 云函数部署

### 2.1 部署云函数
```bash
# 登录云开发
cloudbase login

# 初始化项目
cloudbase init

# 部署云函数
cloudbase functions:deploy --env your-env-id

# 部署单个函数
cloudbase functions:deploy getProductDetail --env your-env-id
cloudbase functions:deploy updateCart --env your-env-id
cloudbase functions:deploy createOrder --env your-env-id
```

### 2.2 云函数列表
- `getProductDetail` - 获取商品详情
- `updateCart` - 更新购物车
- `createOrder` - 创建订单
- `getUserProfile` - 获取用户信息
- `updateInventory` - 更新库存

## 3. 数据库部署

### 3.1 创建数据库集合
```bash
# 使用云开发CLI创建集合
cloudbase database:create banner --env your-env-id
cloudbase database:create product --env your-env-id
cloudbase database:create product_category --env your-env-id
cloudbase database:create shopping_cart --env your-env-id
cloudbase database:create order --env your-env-id
cloudbase database:create user_profile --env your-env-id
cloudbase database:create group_activity --env your-env-id
cloudbase database:create product_inventory --env your-env-id
cloudbase database:create points_history --env your-env-id
```

### 3.2 创建索引
```javascript
// 在数据库控制台执行
db.collection('product').createIndex({ status: 1 })
db.collection('product').createIndex({ createdAt: -1 })
db.collection('order').createIndex({ userId: 1, createdAt: -1 })
db.collection('shopping_cart').createIndex({ userId: 1 })
```

### 3.3 插入初始数据
运行部署脚本：
```bash
node .scripts/deployDatabase.js
```

## 4. 小程序部署

### 4.1 配置小程序
1. 打开微信开发者工具
2. 导入项目
3. 配置appid
4. 设置云开发环境ID

### 4.2 上传代码
```bash
# 使用开发者工具上传
# 或使用CLI上传
cloudbase hosting:deploy --env your-env-id
```

### 4.3 配置域名
在微信公众平台配置：
- 业务域名
- 服务器域名
- 上传域名

## 5. 管理后台部署

### 5.1 Web端部署
```bash
# 构建生产版本
npm run build

# 部署到云开发静态托管
cloudbase hosting:deploy dist --env your-env-id
```

### 5.2 配置管理后台权限
在数据库控制台设置：
- 管理员用户权限
- 数据访问权限
- 操作日志记录

## 6. 验证部署

### 6.1 功能验证清单
- [ ] 首页banner正常显示
- [ ] 商品列表加载正常
- [ ] 购物车功能正常
- [ ] 订单创建成功
- [ ] 支付流程正常
- [ ] 用户登录正常
- [ ] 管理后台访问正常

### 6.2 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] 云函数响应时间 < 1秒
- [ ] 数据库查询优化

## 7. 监控配置

### 7.1 云监控
- 配置云函数监控
- 设置数据库性能监控
- 配置错误告警

### 7.2 小程序监控
- 开启小程序性能监控
- 配置用户行为分析
- 设置异常上报

## 8. 安全设置

### 8.1 数据库安全
- 配置数据库权限规则
- 设置敏感数据加密
- 配置访问日志

### 8.2 云函数安全
- 配置函数调用权限
- 设置API密钥管理
- 配置请求频率限制

## 9. 持续集成

### 9.1 自动化部署
```yaml
# .github/workflows/deploy.yml
name: Deploy to CloudBase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      - name: Install dependencies
        run: npm install
      - name: Deploy to CloudBase
        run: |
          npm install -g @cloudbase/cli
          cloudbase login --apiKeyId ${{ secrets.TCB_KEY_ID }} --apiKey ${{ secrets.TCB_KEY_SECRET }}
          cloudbase functions:deploy --env ${{ secrets.TCB_ENV_ID }}
          cloudbase hosting:deploy --env ${{ secrets.TCB_ENV_ID }}
```

## 10. 故障排查

### 10.1 常见问题
1. **云函数超时** - 检查函数配置和数据库索引
2. **数据库权限错误** - 检查数据库权限规则
3. **小程序白屏** - 检查网络请求和静态资源
4. **支付失败** - 检查支付配置和订单状态

### 10.2 日志查看
```bash
# 查看云函数日志
cloudbase functions:log getProductDetail --env your-env-id

# 查看数据库日志
cloudbase database:log --env your-env-id
```

## 11. 联系方式
- 技术支持：support@yourcompany.com
- 文档地址：https://docs.yourcompany.com
- 问题反馈：https://github.com/yourcompany/ecommerce-miniprogram/issues
