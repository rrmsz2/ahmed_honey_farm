import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout, { Empty, Loading } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, errorMessage } from '@/lib/api';
import { formatDateTime, formatMoney, whatsappLink } from '@/lib/format';

export const ORDER_STATUSES = {
  confirmed: { label: 'جديد (مؤكد)', color: 'bg-amber-100 text-amber-800' },
  processing: { label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800' },
};

const PAGE_SIZE = 20;

const Orders = () => {
  const [orders, setOrders] = useState(null);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    try {
      const params = { limit: PAGE_SIZE, skip: page * PAGE_SIZE };
      if (status !== 'all') params.status = status;
      if (query) params.search = query;
      const { data } = await api.get('/admin/orders', { params });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في تحميل الطلبات'));
      setOrders([]);
    }
  }, [status, query, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.success('تم تحديث حالة الطلب');
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في تحديث الطلب'));
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout title={`الطلبات (${total})`}>
      <div className="flex flex-wrap gap-3 mb-6">
        <form
          className="flex gap-2 flex-1 min-w-[16rem]"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
            setQuery(search.trim());
          }}
        >
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف أو رقم الطلب" />
          <Button type="submit" variant="outline" size="icon" aria-label="بحث">
            <Search className="w-4 h-4" />
          </Button>
        </form>
        <Select
          value={status}
          onValueChange={(value) => {
            setPage(0);
            setStatus(value);
          }}
          dir="rtl"
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الطلبات</SelectItem>
            {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders === null ? (
        <Loading />
      ) : orders.length === 0 ? (
        <Empty>لا توجد طلبات</Empty>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const info = ORDER_STATUSES[order.status] || { label: order.status, color: 'bg-gray-100' };
            const chat = whatsappLink(order.customer_phone, `مرحباً ${order.customer_name}، بخصوص طلبك ${order.number} من منحل أحمد 🍯`);
            return (
              <Card key={order.id}>
                <CardContent className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm text-gray-500">{order.number}</span>
                      <h3 className="text-lg font-bold">{order.customer_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>{info.label}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                      <span>
                        الهاتف: <span className="font-mono" dir="ltr">{order.customer_phone}</span>
                      </span>
                      <span>التاريخ: {formatDateTime(order.created_at)}</span>
                      <span className="font-bold text-amber-700">المجموع: {formatMoney(order.total)}</span>
                    </div>
                    <ul className="border-t pt-3 text-sm text-gray-700 space-y-1">
                      {order.items.map((item) => (
                        <li key={item.product_id}>
                          • {item.name_ar} × {item.quantity} — {formatMoney(item.price * item.quantity)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex md:flex-col gap-2">
                    <Select value={order.status} onValueChange={(value) => updateStatus(order.id, value)} dir="rtl">
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {chat && (
                      <Button variant="outline" asChild className="gap-2 text-green-700">
                        <a href={chat} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="w-4 h-4" />
                          مراسلة العميل
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>السابق</Button>
          <span className="text-sm text-gray-600">صفحة {page + 1} من {pages}</span>
          <Button variant="outline" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>التالي</Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default Orders;
