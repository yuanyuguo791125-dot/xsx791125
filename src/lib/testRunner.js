
// 自动化测试运行器
class AutomatedTestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.isRunning = false;
  }

  // 注册测试用例
  registerTest(name, testFn, options = {}) {
    this.tests.push({
      name,
      testFn,
      timeout: options.timeout || 5000,
      retries: options.retries || 0
    });
  }

  // 运行单个测试
  async runTest(test) {
    let attempts = 0;
    const maxAttempts = test.retries + 1;

    while (attempts < maxAttempts) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          test.testFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('测试超时')), test.timeout)
          )
        ]);
        
        return {
          name: test.name,
          status: 'pass',
          duration: Date.now() - startTime,
          message: result || '测试通过',
          attempts: attempts + 1
        };
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          return {
            name: test.name,
            status: 'fail',
            duration: 0,
            message: error.message,
            attempts
          };
        }
      }
    }
  }

  // 运行所有测试
  async runAll() {
    this.isRunning = true;
    this.results = [];
    
    console.log('🚀 开始自动化测试...');
    
    for (const test of this.tests) {
      const result = await this.runTest(test);
      this.results.push(result);
      
      if (result.status === 'pass') {
        console.log(`✅ ${result.name} (${result.duration}ms)`);
      } else {
        console.error(`❌ ${result.name}: ${result.message} (尝试${result.attempts}次)`);
      }
    }
    
    this.isRunning = false;
    this.printSummary();
    return this.results;
  }

  // 打印测试摘要
  printSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = total - passed;
    
    console.log('\n📊 测试摘要:');
    console.log(`总测试数: ${total}`);
    console.log(`通过: ${passed}`);
    console.log(`失败: ${failed}`);
    console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);
  }

  // 生成测试报告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      results: this.results,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      }
    };
    
    return report;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    return { total, passed, failed: total - passed };
  }
}

// 预定义测试用例
const createStandardTests = () => {
  const runner = new AutomatedTestRunner();

  // 标签验证测试
  runner.registerTest('标签验证-首页', async () => {
    const homeContent = document.querySelector('#home-page');
    if (!homeContent) throw new Error('首页未找到');
    
    const invalidTags = homeContent.querySelectorAll('🔥, ✨, ⏰, 🏷️, 📦, 🏠');
    if (invalidTags.length > 0) {
      throw new Error(`发现 ${invalidTags.length} 个非法标签`);
    }
  });

  // 数据源验证测试
  runner.registerTest('数据源验证-banner', async () => {
    const res = await $w.cloud.callDataSource({
      dataSourceName: 'banner',
      methodName: 'wedaGetRecordsV2',
      params: { pageSize: 1 }
    });
    if (!res || !Array.isArray(res.records)) {
      throw new Error('Banner数据源格式错误');
    }
  });

  runner.registerTest('数据源验证-product', async () => {
    const res = await $w.cloud.callDataSource({
      dataSourceName: 'product',
      methodName: 'wedaGetRecordsV2',
      params: { pageSize: 1 }
    });
    if (!res || !Array.isArray(res.records)) {
      throw new Error('Product数据源格式错误');
    }
  });

  runner.registerTest('数据源验证-shopping_cart', async () => {
    const res = await $w.cloud.callDataSource({
      dataSourceName: 'shopping_cart',
      methodName: 'wedaGetRecordsV2',
      params: { pageSize: 1 }
    });
    if (!res || !Array.isArray(res.records)) {
      throw new Error('购物车数据源格式错误');
    }
  });

  // 图片加载测试
  runner.registerTest('图片加载-懒加载', async () => {
    const images = document.querySelectorAll('img[data-src]');
    let failedCount = 0;
    
    for (const img of images) {
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          if (img.src && img.src.startsWith('http')) {
            setTimeout(() => resolve(), 100);
          } else {
            resolve();
          }
        });
      } catch (error) {
        failedCount++;
      }
    }
    
    if (failedCount > 0) {
      throw new Error(`${failedCount} 张图片加载失败`);
    }
  });

  // 网络请求测试
  runner.registerTest('网络请求-无失败', async () => {
    // 模拟检查网络面板
    const failedRequests = window.failedRequests || [];
    if (failedRequests.length > 0) {
      throw new Error(`发现 ${failedRequests.length} 个失败请求`);
    }
  });

  return runner;
};

// 自动运行测试（开发环境）
if (typeof window !== 'undefined' && window.location.search.includes('autotest=true')) {
  window.addEventListener('load', async () => {
    console.log('🧪 自动测试模式已启动');
    const runner = createStandardTests();
    await runner.runAll();
    
    // 生成测试报告
    const report = runner.generateReport();
    console.log('📋 测试报告:', report);
    
    // 保存到本地存储
    localStorage.setItem('lastTestReport', JSON.stringify(report));
  });
}

// 导出供手动调用
export { AutomatedTestRunner, createStandardTests };
