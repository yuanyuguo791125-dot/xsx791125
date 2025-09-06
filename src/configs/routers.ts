import HOME from '../pages/home.jsx';
import PRODUCTDETAIL from '../pages/productDetail.jsx';
import GROUPLIST from '../pages/groupList.jsx';
import PROFILE from '../pages/profile.jsx';
import CART from '../pages/cart.jsx';
import ORDERLIST from '../pages/orderList.jsx';
import ORDERDETAIL from '../pages/orderDetail.jsx';
import PAYMENT from '../pages/payment.jsx';
import ADMIN/DASHBOARD from '../pages/admin/dashboard.jsx';
import ADMIN/PRODUCTLIST from '../pages/admin/productList.jsx';
export const routers = [{
  id: "home",
  component: HOME
}, {
  id: "productDetail",
  component: PRODUCTDETAIL
}, {
  id: "groupList",
  component: GROUPLIST
}, {
  id: "profile",
  component: PROFILE
}, {
  id: "cart",
  component: CART
}, {
  id: "orderList",
  component: ORDERLIST
}, {
  id: "orderDetail",
  component: ORDERDETAIL
}, {
  id: "payment",
  component: PAYMENT
}, {
  id: "admin/dashboard",
  component: ADMIN/DASHBOARD
}, {
  id: "admin/productList",
  component: ADMIN/PRODUCTLIST
}]