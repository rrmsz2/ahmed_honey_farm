import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trash2, Plus, Minus, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // 1: Cart, 2: Info, 3: OTP
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast({
        title: language === 'ar' ? 'السلة فارغة' : 'Cart is empty',
        description: language === 'ar' ? 'الرجاء إضافة منتجات للسلة' : 'Please add products to cart',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone.startsWith('+968') ? customerInfo.phone : `+968${customerInfo.phone}`,
        items: cart.map(item => ({
          product_id: item.id,
          name_ar: item.name_ar,
          name_en: item.name_en,
          quantity: item.quantity,
          price: item.price
        })),
        total: getCartTotal(),
        language: language
      };

      const response = await axios.post(`${API}/orders`, orderData);
      
      setOrderId(response.data.order_id);
      setStep(3);
      
      toast({
        title: language === 'ar' ? 'تم إرسال رمز التحقق' : 'OTP Sent',
        description: language === 'ar' 
          ? 'تم إرسال رمز التحقق عبر واتساب' 
          : 'Verification code sent via WhatsApp',
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.response?.data?.detail || (language === 'ar' ? 'فشل في إنشاء الطلب' : 'Failed to create order'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/orders/verify-otp`, {
        order_id: orderId,
        otp: otp
      });

      toast({
        title: language === 'ar' ? 'تم تأكيد الطلب!' : 'Order Confirmed!',
        description: language === 'ar' 
          ? 'شكراً لك! سنتواصل معك قريباً' 
          : 'Thank you! We will contact you soon',
      });

      clearCart();
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.response?.data?.detail || (language === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid OTP'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'السلة فارغة' : 'Cart is Empty'}
          </h2>
          <Button onClick={() => navigate('/')}>
            {language === 'ar' ? 'العودة للتسوق' : 'Back to Shopping'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            {step === 1 && (language === 'ar' ? 'السلة' : 'Cart')}
            {step === 2 && (language === 'ar' ? 'معلومات الطلب' : 'Order Information')}
            {step === 3 && (language === 'ar' ? 'التحقق' : 'Verification')}
          </h1>
        </div>

        {/* Step 1: Cart */}
        {step === 1 && (
          <div className="space-y-6">
            {cart.map(item => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`${item.image_url}?w=100&h=100&fit=crop`}
                      alt={language === 'ar' ? item.name_ar : item.name_en}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {language === 'ar' ? item.name_ar : item.name_en}
                      </h3>
                      <p className="text-amber-600 font-bold">{item.price} ريال</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-amber-50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>{language === 'ar' ? 'المجموع الكلي' : 'Total'}</span>
                  <span className="text-amber-600">{getCartTotal()} ريال</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full cta-button text-lg py-6"
              onClick={() => setStep(2)}
            >
              {language === 'ar' ? 'متابعة للطلب' : 'Proceed to Order'}
            </Button>
          </div>
        )}

        {/* Step 2: Customer Info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'أدخل معلوماتك' : 'Enter Your Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div>
                  <label className="block font-medium mb-2">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    required
                    placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    {language === 'ar' ? 'رقم الهاتف (عماني)' : 'Phone Number (Oman)'}
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-4 bg-gray-100 rounded-lg font-mono">+968</span>
                    <Input
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '')})}
                      required
                      maxLength={8}
                      placeholder="9XXXXXXX"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {language === 'ar' 
                      ? 'سيتم إرسال رمز التحقق عبر واتساب'
                      : 'Verification code will be sent via WhatsApp'}
                  </p>
                </div>

                <Button 
                  type="submit"
                  className="w-full cta-button text-lg py-6"
                  disabled={loading}
                >
                  {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {language === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'أدخل رمز التحقق' : 'Enter Verification Code'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <p className="text-center mb-4 text-gray-600">
                    {language === 'ar' 
                      ? `تم إرسال رمز التحقق إلى +968${customerInfo.phone} عبر واتساب`
                      : `Verification code sent to +968${customerInfo.phone} via WhatsApp`}
                  </p>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-2xl font-mono tracking-widest"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full cta-button text-lg py-6"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (
                    language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Checkout;
