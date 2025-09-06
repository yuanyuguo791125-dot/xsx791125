// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { CreditCard, Wallet, ShieldCheck } from 'lucide-react';

export default function Payment(props) {
  const {
    $w
  } = props;
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handlePayment = async () => {
    setLoading(true);
    try {
      // 模拟支付流程
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: '支付成功',
        description: '订单已支付完成'
      });
      $w.utils.navigateTo({
        pageId: 'orderList'
      });
    } catch (error) {
      toast({
        title: '支付失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold">选择支付方式</h1>
        <p className="text-sm text-gray-600">请选择您偏好的支付方式</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">支付方式</h3>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded cursor-pointer">
              <input type="radio" name="payment" value="wechat" checked={paymentMethod === 'wechat'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3" />
              <Wallet className="w-5 h-5 mr-2 text-green-600" />
              <span>微信支付</span>
            </label>
            <label className="flex items-center p-3 border rounded cursor-pointer">
              <input type="radio" name="payment" value="alipay" checked={paymentMethod === 'alipay'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3" />
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              <span>支付宝</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4" />
            <span>支付安全保障，请放心支付</span>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handlePayment} disabled={loading}>
        {loading ? '处理中...' : '确认支付'}
      </Button>
    </div>;
}