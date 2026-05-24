export interface Legislation {
  id: string;
  title: string;
  category: 'Yönetmelik' | 'Yönerge' | 'Senato Kararı' | 'Yönetim Kurulu Kararı' | 'Etik Kurul Kararı';
  date: string;
  documentNo?: string;
  url: string;
  description?: string;
}

export const legislationData: Legislation[] = [
  {
    id: '1',
    title: 'Kütahya Sağlık Bilimleri Üniversitesi Lisansüstü Eğitim ve Öğretim Yönetmeliği',
    category: 'Yönetmelik',
    date: '15.09.2023',
    documentNo: '32310',
    url: '#',
    description: 'Lisansüstü eğitim süreçlerine ilişkin usul ve esasları içerir.',
  },
  {
    id: '2',
    title: 'Önlisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği',
    category: 'Yönetmelik',
    date: '10.08.2022',
    documentNo: '31919',
    url: '#',
    description: 'Önlisans ve lisans programlarındaki eğitim ve sınav kurallarını belirler.',
  },
  {
    id: '3',
    title: 'Bilimsel Araştırma Projeleri (BAP) Uygulama Yönergesi',
    category: 'Yönerge',
    date: '05.01.2024',
    url: '#',
    description: 'BAP birimi tarafından desteklenen projelerin yürütülme esasları.',
  },
  {
    id: '4',
    title: 'Öğrenci Konseyi Yönergesi',
    category: 'Yönerge',
    date: '22.11.2023',
    url: '#',
    description: 'Öğrenci temsilciliği ve konseyi seçim ve çalışma usulleri.',
  },
  {
    id: '5',
    title: '2024 Yılı 1. Senato Kararları - Akademik Takvim Güncellemesi',
    category: 'Senato Kararı',
    date: '12.01.2024',
    documentNo: '2024/01',
    url: '#',
    description: 'Bahar dönemi akademik takviminde yapılan değişiklikler hakkındadır.',
  },
  {
    id: '6',
    title: 'Yönetim Kurulu Kararı - Personel Görevlendirme Esasları',
    category: 'Yönetim Kurulu Kararı',
    date: '18.12.2023',
    documentNo: '2023/45',
    url: '#',
  },
  {
    id: '7',
    title: 'Etik Kurul Çalışma Esasları ve Başvuru Kılavuzu',
    category: 'Etik Kurul Kararı',
    date: '03.03.2023',
    url: '#',
  },
  {
    id: '8',
    title: 'Kütüphane ve Dokümantasyon Hizmetleri Yönergesi',
    category: 'Yönerge',
    date: '14.06.2022',
    url: '#',
  },
  {
    id: '9',
    title: 'Yaz Okulu Eğitim-Öğretim Yönetmeliği',
    category: 'Yönetmelik',
    date: '20.05.2021',
    documentNo: '31487',
    url: '#',
  },
  {
    id: '10',
    title: 'Döner Sermaye İşletmesi Yönetmeliği',
    category: 'Yönetmelik',
    date: '12.11.2019',
    documentNo: '30946',
    url: '#',
  }
];
