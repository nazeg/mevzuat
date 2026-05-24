import React, { useState, useEffect } from 'react';
import { 
  pb, 
  getLegislationList 
} from '../lib/pocketbase';
import { 
  Search, Plus, LogOut, ArrowLeft, BookOpen, ScrollText, 
  Users, Gavel, Trash2, Edit2, ShieldAlert, CheckCircle, 
  Loader2, RefreshCw, FileText, Database, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { legislationData, type Legislation } from '../data/legislation';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [data, setData] = useState<Legislation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');
  const [syncing, setSyncing] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<Legislation['category']>('Yönetmelik');
  const [formDate, setFormDate] = useState('');
  const [formDocumentNo, setFormDocumentNo] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  
  // File upload state (optional)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check login state
  useEffect(() => {
    setIsLoggedIn(pb.authStore.isValid);
    if (pb.authStore.isValid) {
      loadLegislation();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadLegislation() {
    setLoading(true);
    try {
      // Fetch fresh list from pocketbase directly
      const list = await getLegislationList();
      setData(list);
    } catch (err) {
      showNotification('error', 'Mevzuatlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      // First try login using PocketBase Admins / Users auth
      // In latest PocketBase versions, we authenticate users using the standard users collection or admins
      // Standard users auth:
      await pb.collection('users').authWithPassword(email, password);
      setIsLoggedIn(true);
      showNotification('success', 'Giriş başarılı.');
      loadLegislation();
    } catch (err: any) {
      console.warn('Regular user auth failed, trying pocketbase admin auth...', err);
      try {
        // Fallback for pocketbase backends with superuser/admin auth (old and new systems)
        // In pocketbase v0.23+, superusers can be authenticated via pb.admins.authWithPassword or users
        // Let's try standard users again or provide clear feedback
        setAuthError('Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol ediniz.');
      } catch (err2) {
        setAuthError('Giriş başarısız. E-posta veya şifre hatalı.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setIsLoggedIn(false);
    setData([]);
  };

  const handleSeedData = async () => {
    setSyncing(true);
    try {
      let count = 0;
      for (const item of legislationData) {
        // Format date to ISO/PocketBase standard YYYY-MM-DD
        let formattedDate = item.date;
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(item.date)) {
          const [d, m, y] = item.date.split('.');
          formattedDate = `${y}-${m}-${d}`;
        }
        
        await pb.collection('legislation').create({
          title: item.title,
          category: item.category,
          date: formattedDate,
          documentNo: item.documentNo || '',
          url: item.url || '#',
          description: item.description || ''
        });
        count++;
      }
      showNotification('success', `${count} adet örnek mevzuat başarıyla veritabanına aktarıldı.`);
      loadLegislation();
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'Veriler aktarılırken hata oluştu. Lütfen koleksiyonun PocketBase üzerinde tanımlı olduğunu doğrulayın.');
    } finally {
      setSyncing(false);
    }
  };

  const openCreateForm = () => {
    setFormMode('create');
    setEditingId(null);
    setFormTitle('');
    setFormCategory('Yönetmelik');
    // Default to today
    const today = new Date().toISOString().split('T')[0];
    setFormDate(today);
    setFormDocumentNo('');
    setFormUrl('');
    setFormDescription('');
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: Legislation) => {
    setFormMode('edit');
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    
    // Parse date from DD.MM.YYYY to YYYY-MM-DD
    let inputDate = item.date;
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(item.date)) {
      const [d, m, y] = item.date.split('.');
      inputDate = `${y}-${m}-${d}`;
    }
    setFormDate(inputDate);
    setFormDocumentNo(item.documentNo || '');
    setFormUrl(item.url || '');
    setFormDescription(item.description || '');
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDate || !formCategory) {
      showNotification('error', 'Lütfen başlık, kategori ve tarih alanlarını doldurunuz.');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('category', formCategory);
      formData.append('date', formDate);
      formData.append('documentNo', formDocumentNo);
      formData.append('description', formDescription);

      if (selectedFile) {
        formData.append('url', selectedFile);
      } else {
        formData.append('url', formUrl);
      }

      if (formMode === 'create') {
        await pb.collection('legislation').create(formData);
        showNotification('success', 'Mevzuat başarıyla eklendi.');
      } else if (formMode === 'edit' && editingId) {
        await pb.collection('legislation').update(editingId, formData);
        showNotification('success', 'Mevzuat başarıyla güncellendi.');
      }
      setIsFormOpen(false);
      loadLegislation();
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'Kaydetme işlemi başarısız oldu.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu mevzuatı silmek istediğinize emin misiniz?')) return;
    try {
      await pb.collection('legislation').delete(id);
      showNotification('success', 'Mevzuat başarıyla silindi.');
      loadLegislation();
    } catch (err: any) {
      showNotification('error', 'Silme işlemi sırasında bir hata oluştu.');
    }
  };

  // Filter & Search Logic
  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.documentNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Tümü' || item.category === categoryFilter;
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">KSBÜ MEVZUAT</h1>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Yönetim Paneli Girişi</p>
          </div>

          <Card className="bg-slate-950/70 backdrop-blur-xl border border-slate-800 shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Yönetici Girişi</CardTitle>
              <CardDescription className="text-slate-500">Mevzuat eklemek, düzenlemek veya silmek için yetkili hesabı kullanın.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">E-Posta Adresi</label>
                  <Input 
                    type="email" 
                    placeholder="admin@ksbu.edu.tr" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-accent"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Şifre</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-accent"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full bg-accent hover:bg-accent/90 text-slate-950 font-bold py-2.5 rounded-lg border-none mt-2 cursor-pointer transition-colors"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Giriş Yapılıyor...
                    </span>
                  ) : 'Giriş Yap'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider mx-auto mt-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md"
            style={{
              backgroundColor: notification.type === 'success' ? 'rgba(6, 78, 59, 0.9)' : 'rgba(153, 27, 27, 0.9)',
              borderColor: notification.type === 'success' ? '#059669' : '#dc2626'
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-300 shrink-0" />
            )}
            <span className="text-sm font-medium text-white">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center shrink-0 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold text-xl border-2 border-accent shrink-0">
            KSBÜ
          </div>
          <div>
            <h1 className="text-base font-bold leading-none uppercase tracking-wide text-white">Mevzuat Yönetim Paneli</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1">Sistem Kontrol Paneli</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-bold h-9 px-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> SİTEYE DÖN
          </Button>

          <Button 
            variant="destructive"
            onClick={handleLogout}
            className="text-xs font-bold h-9 px-4 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" /> GÜVENLİ ÇIKIŞ
          </Button>
        </div>
      </header>

      {/* Main Admin Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-72 bg-slate-900/50 border-r border-slate-850 p-6 flex flex-col gap-6 shrink-0">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Veri Filtreleme</h3>
            <div className="space-y-1">
              {['Tümü', 'Yönetmelik', 'Yönerge', 'Senato Kararı', 'Yönetim Kurulu Kararı'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    categoryFilter === cat 
                      ? 'bg-accent text-slate-950' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-800" />

          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Veri İşlemleri</h3>
            <div className="space-y-2">
              <Button 
                onClick={openCreateForm}
                className="w-full bg-accent hover:bg-accent/90 text-slate-950 font-bold text-xs py-2 rounded-lg cursor-pointer border-none"
              >
                <Plus className="w-4 h-4 mr-2" /> Yeni Mevzuat Ekle
              </Button>
              
              {data.length === 0 && !loading && (
                <Button 
                  onClick={handleSeedData}
                  disabled={syncing}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer border border-slate-700"
                >
                  {syncing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Veriler Aktarılıyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Database className="w-3.5 h-3.5 text-accent" /> Örnek Verileri Yükle
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-accent" />
                <span className="text-[10px] text-accent font-bold uppercase tracking-wider">Veritabanı Durumu</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                PocketBase aktif olarak bağlanmıştır. Değişiklikler anlık olarak yayına yansır.
              </p>
            </div>
          </div>
        </aside>

        {/* List Content */}
        <main className="flex-1 p-8 flex flex-col overflow-hidden bg-slate-950">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Mevzuat Yönetim Listesi 
                {loading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Toplam {filteredData.length} kayıt listelendi.</p>
            </div>
            
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Başlık veya belge no ile ara..." 
                className="bg-slate-900 border-slate-800 text-white pl-9 text-xs focus-visible:ring-accent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-850 z-10 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Tarih</th>
                    <th className="px-6 py-4">Tür</th>
                    <th className="px-6 py-4">Belge No</th>
                    <th className="px-6 py-4">Mevzuat Adı</th>
                    <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-2" />
                          <p className="text-slate-500 font-bold">Veriler Yükleniyor...</p>
                        </td>
                      </tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className="hover:bg-slate-850/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-400 tabular-nums">
                            {item.date}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={getBadgeStyles(item.category)}>
                              {item.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                            {item.documentNo || '-'}
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="font-bold text-slate-200 line-clamp-2 leading-relaxed">{item.title}</p>
                            {item.description && <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">{item.description}</p>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="xs"
                                variant="outline"
                                onClick={() => openEditForm(item)}
                                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Düzenle
                              </Button>
                              <Button 
                                size="xs"
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                                className="cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Sil
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                          <p className="text-slate-500 font-bold">Kayıt Bulunamadı</p>
                          <p className="text-[11px] text-slate-600 mt-1">Yeni kayıt eklemek için 'Yeni Mevzuat Ekle' butonunu kullanın.</p>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Form Drawer/Modal Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 z-40 bg-black"
            />
            
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl p-8 flex flex-col font-sans text-slate-100"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-850 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {formMode === 'create' ? 'Yeni Mevzuat Girişi' : 'Mevzuatı Güncelle'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Lütfen gerekli tüm bilgileri doldurun.</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  KAPAT ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-bold uppercase">Mevzuat Adı (Başlık)</label>
                  <Input 
                    placeholder="Örn: Öğrenci Konseyi Yönergesi" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 text-xs focus-visible:ring-accent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Legislation['category'])}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg text-white text-xs px-3 py-2 outline-none focus:border-accent"
                    >
                      <option value="Yönetmelik">Yönetmelik</option>
                      <option value="Yönerge">Yönerge</option>
                      <option value="Senato Kararı">Senato Kararı</option>
                      <option value="Yönetim Kurulu Kararı">Yönetim Kurulu Kararı</option>
                      <option value="Etik Kurul Kararı">Etik Kurul Kararı</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase">Yayın Tarihi</label>
                    <Input 
                      type="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs focus-visible:ring-accent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-bold uppercase">Resmi Gazete / Karar No (İsteğe Bağlı)</label>
                  <Input 
                    placeholder="Örn: 32310 veya 2024/01" 
                    value={formDocumentNo}
                    onChange={(e) => setFormDocumentNo(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 text-xs focus-visible:ring-accent"
                  />
                </div>

                <div className="space-y-2 border-t border-slate-850 pt-4">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Mevzuat Dosyası veya Linki</span>
                  
                  {/* File Upload input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold block">PDF Dosyası Yükle</label>
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-400 border border-slate-800 rounded-lg p-2 bg-slate-950 focus:border-accent"
                    />
                    {selectedFile && (
                      <span className="text-[11px] text-accent font-bold block mt-1">Seçilen dosya: {selectedFile.name}</span>
                    )}
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-slate-600 text-[10px] font-bold uppercase">Veya Alternatif URL Girin</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <div className="space-y-1.5">
                    <Input 
                      placeholder="https://mevzuat.gov.tr/... veya #" 
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 text-xs focus-visible:ring-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-bold uppercase">Mevzuat Açıklaması (İsteğe Bağlı)</label>
                  <textarea 
                    placeholder="Mevzuatın içeriği hakkında kısa bir açıklama..." 
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-white text-xs px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="mt-auto pt-6 border-t border-slate-850 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 border-slate-750 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer font-bold text-xs"
                  >
                    İptal Et
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploadingFile}
                    className="flex-1 bg-accent hover:bg-accent/90 text-slate-950 font-bold text-xs cursor-pointer border-none"
                  >
                    {uploadingFile ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...
                      </span>
                    ) : 'Değişiklikleri Kaydet'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
