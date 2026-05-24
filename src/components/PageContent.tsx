import React, { useState } from 'react';
import { Search, ChevronRight, BookOpen, ScrollText, Users, Gavel, LayoutDashboard, History, HelpCircle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { legislationData, Legislation } from '@/data/legislation';
import { cn } from '@/lib/utils';

export default function PageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  const categories = [
    { name: 'Tümü', icon: <LayoutDashboard className="w-4 h-4" />, count: legislationData.length },
    { name: 'Yönetmelik', icon: <BookOpen className="w-4 h-4" />, count: legislationData.filter(i => i.category === 'Yönetmelik').length },
    { name: 'Yönerge', icon: <ScrollText className="w-4 h-4" />, count: legislationData.filter(i => i.category === 'Yönerge').length },
    { name: 'Senato Kararı', icon: <Users className="w-4 h-4" />, count: legislationData.filter(i => i.category === 'Senato Kararı').length },
    { name: 'Yönetim Kurulu Kararı', icon: <Gavel className="w-4 h-4" />, count: legislationData.filter(i => i.category === 'Yönetim Kurulu Kararı').length },
  ];

  const filteredData = legislationData.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getBadgeStyles = (category: string) => {
    switch (category) {
      case 'Yönetmelik': return 'bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px]';
      case 'Senato Kararı': return 'bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px]';
      case 'Yönerge': return 'bg-amber-50 text-amber-700 border-amber-100 uppercase text-[10px]';
      case 'Yönetim Kurulu Kararı': return 'bg-purple-50 text-purple-700 border-purple-100 uppercase text-[10px]';
      default: return 'bg-slate-50 text-slate-700 border-slate-100 uppercase text-[10px]';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-primary text-white shrink-0 px-8 py-4 flex justify-between items-center shadow-lg border-b-2 border-accent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold text-xl border-2 border-accent shrink-0">
            KSBÜ
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight uppercase">Kütahya Sağlık Bilimleri Üniversitesi</h1>
            <p className="text-xs text-white/40 font-medium tracking-widest uppercase mt-1">Mevzuat Bilgi Sistemi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:relative md:block">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
            <Input 
              placeholder="Mevzuat ara..." 
              className="bg-white/10 border-white/20 rounded-md py-1.5 pl-10 pr-4 text-sm w-64 focus-visible:ring-accent text-white placeholder:text-white/30 focus:bg-white/20 transition-all border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-white text-xs font-bold py-2 px-6 rounded transition-colors border-none">
            EBYS GİRİŞ
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 p-6 flex-col space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Mevzuat Kategorileri</h3>
            <nav className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "w-full flex items-center justify-between group p-2.5 rounded-lg transition-all text-left",
                    selectedCategory === cat.name 
                      ? "bg-slate-100 text-primary font-bold" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-primary font-medium"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(selectedCategory === cat.name ? "text-accent" : "text-slate-400 group-hover:text-accent")}>{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    selectedCategory === cat.name ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <Separator className="bg-slate-100" />

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Arşiv Birimi</h3>
            <div className="grid grid-cols-2 gap-2">
              {['2024', '2023', '2022', '2021'].map(year => (
                <Button key={year} variant="outline" size="sm" className="text-[11px] h-8 border-slate-200 hover:border-accent hover:bg-accent/5">
                  {year}
                </Button>
              ))}
            </div>
            <Button variant="link" className="text-xs text-accent font-bold p-0 mt-3 h-auto">Tüm Arşivi Gör <ChevronRight className="w-3 h-3 ml-1" /></Button>
          </div>

          <div className="mt-auto">
            <div className="bg-accent/5 p-4 rounded-xl border border-accent/10">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-accent" />
                <p className="text-[10px] text-accent font-bold uppercase">Yardım ve Destek</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight italic">
                Mevzuat güncellemeleri hakkında sorularınız için yazı işleri personeli ile iletişime geçiniz.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <History className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-tighter">Son Güncellemeler</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                {selectedCategory === 'Tümü' ? 'Son Yayınlanan Mevzuatlar' : `${selectedCategory} Bilgi Listesi`}
              </h2>
              <p className="text-slate-500 text-sm">Üniversitemiz bünyesinde yayınlanan güncel kurallar ve kararlar veri tabanı.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 px-4 gap-2 text-xs font-bold shadow-sm">
                <Filter className="w-3.5 h-3.5" /> Gelişmiş Filtrele
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4 font-bold">Yayın Tarihi</th>
                    <th className="px-6 py-4 font-bold">Tür / Belge No</th>
                    <th className="px-6 py-4 font-bold">Mevzuat Adı</th>
                    <th className="px-6 py-4 font-bold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="hover:bg-slate-50 group transition-colors cursor-default"
                        >
                          <td className="px-6 py-5 text-sm font-medium text-slate-500 tabular-nums">
                            {item.date}
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="outline" className={cn("font-bold px-2 py-0.5 border shadow-none", getBadgeStyles(item.category))}>
                              {item.category}
                            </Badge>
                            {item.documentNo && (
                              <span className="block text-[10px] text-slate-400 mt-1 font-medium italic">No: {item.documentNo}</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-slate-800 leading-relaxed max-w-xl group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            {item.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">{item.description}</p>}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Button 
                              variant="ghost" 
                              className="text-accent hover:text-accent hover:bg-accent/10 font-bold text-xs uppercase tracking-tighter px-3 h-8 rounded-lg"
                            >
                              PDF Görüntüle
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-500 font-bold">Kayıt Bulunamadı</p>
                          <p className="text-xs text-slate-400 mt-1">Lütfen arama teriminizi kontrol ediniz.</p>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </ScrollArea>
            
            {/* Pagination / Info Bar */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex justify-between items-center text-[11px] text-slate-500">
              <span className="font-medium">Toplam {filteredData.length} kayıt içerisinden gösteriliyor.</span>
              <div className="flex items-center gap-1 font-bold">
                <button className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-md text-primary">1</button>
                <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-md transition-colors">2</button>
                <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-md transition-colors">3</button>
                <span className="w-7 h-7 flex items-center justify-center">...</span>
                <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-md transition-colors">12</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 px-8 py-3 flex justify-between items-center shrink-0">
        <p className="text-[10px] text-slate-400 font-medium">© 2024 Kütahya Sağlık Bilimleri Üniversitesi | Bilgi İşlem Daire Başkanlığı</p>
        <div className="flex gap-6 items-center">
          <a href="#" className="text-[10px] text-slate-400 hover:text-accent font-medium">KVKK Aydınlatma Metni</a>
          <a href="#" className="text-[10px] text-slate-400 hover:text-accent font-medium">Gizlilik Politikası</a>
          <div className="h-3 w-[1px] bg-slate-200" />
          <p className="text-[10px] text-slate-500 font-bold italic tracking-tight">Sağlığın Üniversitesi</p>
        </div>
      </footer>
    </div>
  );
}
