// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
// @ts-ignore;
import { Settings, PlayCircle, Bug } from 'lucide-react';

// @ts-ignore;
import { TestRunnerComponent } from '@/components/TestRunner';
// @ts-ignore;
import { PageTestSuite } from '@/components/PageTestSuite';
// @ts-ignore;

// 测试配置
const TEST_CONFIG = {
  global: {
    name: '全局测试',
    description: '跨页面通用测试用例'
  },
  pages: {
    home: {
      name: '首页',
      description: '首页功能测试'
    },
    productDetail: {
      name: '商品详情',
      description: '商品详情页测试'
    },
    cart: {
      name: '购物车',
      description: '购物车功能测试'
    },
    groupList: {
      name: '拼团列表',
      description: '拼团活动测试'
    },
    orderList: {
      name: '订单列表',
      description: '订单管理测试'
    }
  }
};
export function TestIntegration() {
  const [activeTab, setActiveTab] = useState('global');
  const [isDevMode, setIsDevMode] = useState(false);

  // 检查开发模式
  useState(() => {
    setIsDevMode(window.location.search.includes('test=true'));
  });
  if (!isDevMode) {
    return null; // 生产环境不显示
  }
  return <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Bug className="w-4 h-4" />
              自动化测试面板
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setIsDevMode(false)}>
              关闭
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global">全局测试</TabsTrigger>
              <TabsTrigger value="pages">页面测试</TabsTrigger>
            </TabsList>

            <TabsContent value="global" className="mt-4">
              <TestRunnerComponent />
            </TabsContent>

            <TabsContent value="pages" className="mt-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(TEST_CONFIG.pages).map(([pageId, config]) => <div key={pageId}>
                    <h4 className="font-semibold mb-2">{config.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                    <PageTestSuite pageId={pageId} />
                  </div>)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
}

// 开发模式注入
export function injectTestPanel() {
  if (typeof window !== 'undefined' && window.location.search.includes('test=true')) {
    const root = document.createElement('div');
    root.id = 'test-panel-root';
    document.body.appendChild(root);

    // 使用React渲染测试面板
    import('react-dom').then(ReactDOM => {
      ReactDOM.render(<TestIntegration />, root);
    });
  }
}