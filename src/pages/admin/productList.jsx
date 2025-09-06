// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function AdminProductList(props) {
  const {
    $w
  } = props;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const {
    toast
  } = useToast();
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          limit: 50
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          }
        }
      })]);
      setProducts(productsRes.records || []);
      setCategories(categoriesRes.records || []);
    } catch (error) {
      toast({
        title: "获取商品失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  const handleDelete = async productId => {
    if (!confirm('确定要删除这个商品吗？')) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: productId
              }
            }
          }
        }
      });
      toast({
        title: "删除成功"
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  return <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">商品管理</h1>
          <Button onClick={() => $w.utils.navigateTo({
          pageId: 'adminProductEdit'
        })}>
            <Plus className="mr-2 h-4 w-4" />
            添加商品
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <Input placeholder="搜索商品..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-xs" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">商品</th>
                    <th className="text-left p-2">价格</th>
                    <th className="text-left p-2">库存</th>
                    <th className="text-left p-2">状态</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => <tr key={product._id} className="border-b">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-2">¥{product.price}</td>
                      <td className="p-2">{product.stock || 0}</td>
                      <td className="p-2">
                        <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                          {product.status === 'active' ? '上架' : '下架'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => $w.utils.navigateTo({
                        pageId: 'adminProductEdit',
                        params: {
                          productId: product._id
                        }
                      })}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}