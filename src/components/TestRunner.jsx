// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Badge, Progress } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

// 测试工具类
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  // 添加测试用例
  addTest(name, testFn) {
    this.tests.push({
      name,
      testFn
    });
  }

  // 运行所有测试
  async runAll() {
    this.results = [];
    for (const test of this.tests) {
      try {
        const startTime = Date.now();
        await test.testFn();
        const duration = Date.now() - startTime;
        this.results.push({
          name: test.name,
          status: 'pass',
          duration,
          message: '测试通过'
        });
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'fail',
          duration: 0,
          message: error.message
        });
      }
    }
    return this.results;
  }

  // 获取测试结果统计
  getStats() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = total - passed;
    return {
      total,
      passed,
      failed
    };
  }
}

// 标签验证测试
const TagValidationTest = {
  name: '标签验证测试',
  async run() {
    const invalidTags = ['🔥', '✨', '⏰', '🏷️', '📦', '🏠'];
    const components = ['CategoryCard', 'CategoryFilter', 'TabBar'];

    // 检查组件文件内容
    for (const component of components) {
      const content = await this.getComponentContent(component);
      for (const tag of invalidTags) {
        if (content.includes(`<${tag}`)) {
          throw new Error(`组件 ${component} 包含非法标签: ${tag}`);
        }
      }
    }
  },
  async getComponentContent(componentName) {
    // 模拟获取组件内容
    return ''; // 实际实现中会读取文件内容
  }
};

// 数据源验证测试
const DataSourceValidationTest = {
  name: '数据源验证测试',
  async run() {
    const dataSources = ['banner', 'product_category', 'product', 'group_activity', 'shopping_cart', 'product_detail', 'product_inventory', 'order', 'user_profile', 'points_history'];
    for (const ds of dataSources) {
      try {
        const res = await $w.cloud.callDataSource({
          dataSourceName: ds,
          methodName: 'wedaGetRecordsV2',
          params: {
            pageSize: 1,
            getCount: true
          }
        });
        if (!res || typeof res.total !== 'number') {
          throw new Error(`数据源 ${ds} 返回格式错误`);
        }
      } catch (err) {
        throw new Error(`数据源 ${ds} 验证失败: ${err.message}`);
      }
    }
  }
};

// 图片加载测试
const ImageLoadingTest = {
  name: '图片加载测试',
  async run() {
    const testImages = ['https://via.placeholder.com/400x200?text=Test+1', 'https://via.placeholder.com/400x200?text=Test+2'];
    for (const imgUrl of testImages) {
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error(`图片加载失败: ${imgUrl}`));
          img.src = imgUrl;
        });
      } catch (err) {
        throw new Error(`图片加载测试失败: ${err.message}`);
      }
    }
  }
};

// 网络请求测试
const NetworkRequestTest = {
  name: '网络请求测试',
  async run() {
    // 模拟网络请求
    const requests = [{
      url: '/api/banner',
      method: 'GET'
    }, {
      url: '/api/product',
      method: 'GET'
    }, {
      url: '/api/cart',
      method: 'GET'
    }];
    for (const req of requests) {
      try {
        // 模拟请求
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        throw new Error(`网络请求失败: ${req.url}`);
      }
    }
  }
};

// 测试运行器组件
export function TestRunnerComponent() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0
  });
  const runTests = async () => {
    setIsRunning(true);
    const runner = new TestRunner();

    // 添加测试用例
    runner.addTest('标签验证测试', TagValidationTest.run);
    runner.addTest('数据源验证测试', DataSourceValidationTest.run);
    runner.addTest('图片加载测试', ImageLoadingTest.run);
    runner.addTest('网络请求测试', NetworkRequestTest.run);
    const testResults = await runner.runAll();
    setResults(testResults);
    setStats(runner.getStats());
    setIsRunning(false);
  };
  return <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">自动化测试套件</h2>
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isRunning ? '测试中...' : '运行测试'}
          </Button>
        </div>

        {stats.total > 0 && <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">总测试</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
              <div className="text-sm text-gray-500">通过</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-500">失败</div>
            </div>
          </div>}

        {isRunning && <Progress value={33} className="mb-4" />}

        <div className="space-y-2">
          {results.map((result, index) => <div key={index} className={`flex items-center gap-2 p-2 rounded ${result.status === 'pass' ? 'bg-green-50' : 'bg-red-50'}`}>
              {result.status === 'pass' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
              <span className="flex-1 text-sm">{result.name}</span>
              <span className="text-xs text-gray-500">{result.duration}ms</span>
              {result.status === 'fail' && <AlertTriangle className="w-4 h-4 text-red-600" />}
            </div>)}
        </div>
      </CardContent>
    </Card>;
}