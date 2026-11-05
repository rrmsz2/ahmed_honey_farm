import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Minus, Plus, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/landing/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { api, errorMessage } from '@/lib/api';
import { formatMoney, imageUrl } from '@/lib/format';

const STEPS = { CART: 1, INFO: 2, VERIFY: 3, DONE: 4 };

const useCountdown = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  return [seconds, setSeconds];
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, setQuantity, removeItem, clear, syncWithCatalogue, maxQuantity } = useCart();
  const { t, language, pick, isArabic } = useLanguage();
  const c = t.checkout;

  const [step, setStep] = useState(STEPS.CART);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useCountdown();

  // Refresh prices and drop products that are no longer available.
  useEffect(() => {
    api
      .get('/products')
      .then(({ data }) => {
        if (syncWithCatalogue(data.products)) toast.warning(c.unavailableRemoved);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
  const fullPhone = `+968${customer.phone}`;

  const submitOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        customer_name: customer.name.trim(),
        customer_phone: fullPhone,
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        language,
      });
      setOrder(data);
      setOtp('');
      setResendIn(data.resend_after);
      setStep(STEPS.VERIFY);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/orders/verify-otp', { order_id: order.order_id, otp });
      setOrder((prev) => ({ ...prev, ...data.order }));
      clear();
      setStep(STEPS.DONE);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      const { data } = await api.post('/orders/resend-otp', { order_id: order.order_id });
      setResendIn(data.resend_after);
      toast.success(c.codeResent);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const goBack = () => {
    if (step === STEPS.INFO || step === STEPS.VERIFY) setStep(step - 1);
    else navigate('/');
  };

  const titles = { [STEPS.CART]: c.cart, [STEPS.INFO]: c.info, [STEPS.VERIFY]: c.verify, [STEPS.DONE]: c.done };
  const isEmpty = items.length === 0 && step === STEPS.CART;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 max-w-3xl pt-28 pb-12">
        {isEmpty ? (
          <div className="text-center py-24">
            <h1 className="text-2xl font-bold mb-6">{c.empty}</h1>
            <Button onClick={() => navigate('/', { state: { scrollTo: 'products' } })} className="cta-button">
              {c.backToShop}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              {step !== STEPS.DONE && (
                <Button variant="ghost" size="icon" onClick={goBack} aria-label={c.back}>
                  <BackIcon className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-3xl font-bold">{titles[step]}</h1>
            </div>

            {step === STEPS.CART && (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 sm:p-6 flex flex-wrap items-center gap-4">
                      <img
                        src={imageUrl(item.image_url, { w: 160, h: 160 })}
                        alt={pick(item, 'name')}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-[8rem]">
                        <h3 className="font-bold text-lg">{pick(item, 'name')}</h3>
                        <p className="text-amber-600 font-bold">{formatMoney(item.price, language)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => setQuantity(item.id, item.quantity - 1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={item.quantity >= maxQuantity}
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button size="icon" variant="destructive" onClick={() => removeItem(item.id)} aria-label={c.remove}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-amber-50">
                  <CardContent className="p-6 flex justify-between items-center text-xl font-bold">
                    <span>{c.total}</span>
                    <span className="text-amber-600">{formatMoney(total, language)}</span>
                  </CardContent>
                </Card>

                <Button className="w-full cta-button text-lg py-6" onClick={() => setStep(STEPS.INFO)}>
                  {c.proceed}
                </Button>
              </div>
            )}

            {step === STEPS.INFO && (
              <Card>
                <CardHeader>
                  <CardTitle>{c.enterInfo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitOrder} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{c.name}</Label>
                      <Input
                        id="name"
                        autoComplete="name"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        required
                        minLength={2}
                        maxLength={80}
                        placeholder={c.namePlaceholder}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{c.phone}</Label>
                      <div className="flex gap-2" dir="ltr">
                        <span className="flex items-center px-4 bg-gray-100 rounded-md font-mono">+968</span>
                        <Input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                          required
                          pattern="[79][0-9]{7}"
                          placeholder="9XXXXXXX"
                          className="flex-1 font-mono"
                        />
                      </div>
                      <p className="text-sm text-gray-600">{c.phoneHint}</p>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-4">
                      <span>{c.total}</span>
                      <span className="text-amber-600">{formatMoney(total, language)}</span>
                    </div>
                    <Button type="submit" className="w-full cta-button text-lg py-6 gap-2" disabled={loading}>
                      {loading ? c.sending : (
                        <>
                          <Send className="w-5 h-5" />
                          {c.sendCode}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === STEPS.VERIFY && (
              <Card>
                <CardHeader>
                  <CardTitle>{c.enterCode}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={verify} className="space-y-6">
                    <p className="text-center text-gray-600">
                      {c.codeSentTo} <span dir="ltr" className="font-mono font-bold">{fullPhone}</span>
                    </p>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      autoFocus
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      aria-label={c.enterCode}
                      className="text-center text-2xl font-mono tracking-[0.5em]"
                      dir="ltr"
                    />
                    <Button type="submit" className="w-full cta-button text-lg py-6" disabled={loading || otp.length !== 6}>
                      {loading ? c.verifying : c.confirm}
                    </Button>
                    <div className="text-center">
                      <Button type="button" variant="link" disabled={resendIn > 0} onClick={resend}>
                        {resendIn > 0 ? `${c.resendIn} ${resendIn}${c.seconds}` : c.resend}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === STEPS.DONE && order && (
              <Card className="text-center">
                <CardContent className="p-10 space-y-4">
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
                  <h2 className="text-2xl font-bold">{c.thanks}</h2>
                  <p className="text-lg">
                    {c.orderNumber}: <span className="font-mono font-bold">{order.number}</span>
                  </p>
                  <p className="text-gray-600">{c.contactSoon}</p>
                  <Button onClick={() => navigate('/')} className="cta-button mt-4">
                    {c.backToShop}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Checkout;
