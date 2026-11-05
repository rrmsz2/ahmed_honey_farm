import { useSection } from '@/context/SiteContentContext';

const Story = () => {
  const content = useSection('story');
  const stats = Array.isArray(content.stats) ? content.stats.filter((s) => s?.number || s?.label) : [];

  return (
    <section id="story" className="py-24 bg-gradient-to-b from-amber-50 to-white scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">{content.title}</h2>
            <p className="section-subtitle">{content.subtitle}</p>
          </div>

          {content.content && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
              <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">{content.content}</p>
            </div>
          )}

          {stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card group">
                  <div className="stat-number group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Story;
