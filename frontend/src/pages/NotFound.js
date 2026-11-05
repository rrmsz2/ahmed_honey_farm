import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-amber-50 p-4 text-center">
      <div className="text-7xl">🐝</div>
      <h1 className="text-3xl font-bold">404 — {t.notFound.title}</h1>
      <Button asChild className="cta-button">
        <Link to="/">{t.notFound.back}</Link>
      </Button>
    </div>
  );
};

export default NotFound;
