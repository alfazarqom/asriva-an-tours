import { DestinationInfo } from '../types/travel';

export const DESTINATIONS_DATA: DestinationInfo[] = [
  {
    id: 'dest-bali',
    name: 'Bali & Nusa Penida',
    country: 'Indonesia',
    region: 'Kepulauan Nusa Tenggara',
    category: 'Tur Domestik',
    tagline: 'Pulau Dewata, Terasering Hijau & Laguna Tebing',
    description:
      'Bali memadukan arsitektur pura yang sakral, dataran tinggi vulkanik, terasering sawah Ubud yang asri, serta tebing kapur dramatis di Nusa Penida. Ideal untuk retret tenang, wisata budaya, dan eksplorasi pesisir.',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'April – Oktober (Musim Kemarau)',
    language: 'Bahasa Indonesia, Bali, Inggris',
    currency: 'IDR (Rupiah Indonesia)',
    timezone: 'WITA (UTC+8)',
    featured: true,
    mapCenter: { lat: -8.6705, lng: 115.25 },
    mapZoom: 10,
    popularAttractions: [
      {
        name: 'Tebing Kelingking & Pantai Diamond',
        description: 'Teluk biru kehijauan ikonik yang diapit formasi tebing kapur menjulang di Nusa Penida.',
        category: 'Alam Pesisir',
        coordinates: { lat: -8.751, lng: 115.4733 }
      },
      {
        name: 'Tegalalang & Dataran Tinggi Ubud',
        description: 'Sistem irigasi subak warisan UNESCO, desa pengrajin seni, dan resor kesehatan di tengah hutan.',
        category: 'Budaya & Warisan',
        coordinates: { lat: -8.4312, lng: 115.2793 }
      },
      {
        name: 'Pura Luhur Uluwatu',
        description: 'Pura di atas tebing yang menghadap Samudra Hindia dengan pertunjukan tari Kecak saat matahari terbenam.',
        category: 'Ikon Wisata',
        coordinates: { lat: -8.8291, lng: 115.0849 }
      }
    ]
  },
  {
    id: 'dest-labuan-bajo',
    name: 'Labuan Bajo & Komodo',
    country: 'Indonesia',
    region: 'Nusa Tenggara Timur',
    category: 'Tur Domestik',
    tagline: 'Pelayaran Kepulauan, Pasir Merah Muda & Naga Purba',
    description:
      'Gerbang menuju Taman Nasional Komodo, Labuan Bajo menawarkan pelayaran kapal Phinisi, pendakian panorama Pulau Padar, terumbu karang eksotis, serta pertemuan langsung dengan komodo di habitat aslinya.',
    heroImage: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'April – November',
    language: 'Bahasa Indonesia, Manggarai, Inggris',
    currency: 'IDR (Rupiah Indonesia)',
    timezone: 'WITA (UTC+8)',
    featured: true,
    mapCenter: { lat: -8.555, lng: 119.54 },
    mapZoom: 10,
    popularAttractions: [
      {
        name: 'Puncak Matahari Terbit Pulau Padar',
        description: 'Tiga teluk melengkung dengan pasir putih, hitam, dan merah muda dari puncak bukit vulkanik.',
        category: 'Trekking Petualangan',
        coordinates: { lat: -8.6476, lng: 119.563 }
      },
      {
        name: 'Taman Nasional Komodo',
        description: 'Jelajah satwa liar dipandu ranger resmi di habitat alami kadal terbesar di dunia.',
        category: 'Satwa Liar',
        coordinates: { lat: -8.5433, lng: 119.4883 }
      },
      {
        name: 'Manta Point & Taka Makassar',
        description: 'Hamparan pasir timbul jernih dan snorkeling berdampingan dengan ikan pari manta yang anggun.',
        category: 'Bahari',
        coordinates: { lat: -8.4744, lng: 119.5742 }
      }
    ]
  },
  {
    id: 'dest-kyoto-tokyo',
    name: 'Tokyo & Kyoto',
    country: 'Jepang',
    region: 'Kanto & Kansai',
    category: 'Tur Internasional',
    tagline: 'Kuil Zen Bersejarah & Metropolis Modern',
    description:
      'Nikmati perpaduan harmonis antara distrik futuristik Tokyo dan jalanan kayu bersejarah Kyoto, hutan bambu, serta kuil kuno yang terhubung oleh kereta cepat Shinkansen.',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'Maret – Mei & Oktober – November',
    language: 'Bahasa Jepang, Inggris (Area Wisata)',
    currency: 'JPY (Yen Jepang)',
    timezone: 'JST (UTC+9)',
    featured: true,
    mapCenter: { lat: 35.35, lng: 137.8 },
    mapZoom: 6,
    popularAttractions: [
      {
        name: 'Fushimi Inari & Arashiyama',
        description: 'Ribuan gerbang torii merah menyala dan jalur hutan bambu yang menenangkan di Kyoto.',
        category: 'Warisan Budaya',
        coordinates: { lat: 34.9671, lng: 135.7727 }
      },
      {
        name: 'Gunung Fuji & Lembah Hakone',
        description: 'Pelayaran danau vulkanik dengan pemandangan ikonik puncak tertinggi di Jepang.',
        category: 'Panorama Alam',
        coordinates: { lat: 35.3606, lng: 138.7274 }
      },
      {
        name: 'Asakusa & Shibuya Tokyo',
        description: 'Dari lampion bersejarah Kuil Senso-ji hingga pusat kuliner dan arsitektur modern.',
        category: 'Eksplorasi Kota',
        coordinates: { lat: 35.7148, lng: 139.7967 }
      }
    ]
  },
  {
    id: 'dest-swiss',
    name: 'Pegunungan Alpen Swiss & Lucerne',
    country: 'Swiss',
    region: 'Eropa Tengah',
    category: 'Tur Internasional',
    tagline: 'Gletser Alpen, Kereta Panorama & Desa Tepi Danau',
    description:
      'Jelajahi puncak Alpen bersalju, danau gletser jernih, dan desa-desa Swiss bak negeri dongeng menaiki kereta pegunungan panorama kelas dunia.',
    heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'Mei – September & Desember – Maret',
    language: 'Jerman, Prancis, Italia, Inggris',
    currency: 'CHF (Franc Swiss)',
    timezone: 'CET (UTC+1)',
    featured: false,
    mapCenter: { lat: 46.78, lng: 8.15 },
    mapZoom: 8,
    popularAttractions: [
      {
        name: 'Jungfraujoch – Puncak Eropa',
        description: 'Perjalanan kereta bergerigi menuju stasiun kereta tertinggi di Eropa dan Gletser Aletsch.',
        category: 'Kereta Alpen',
        coordinates: { lat: 46.5475, lng: 7.9851 }
      },
      {
        name: 'Danau Lucerne & Gunung Pilatus',
        description: 'Pelayaran kapal melintasi danau Alpen yang jernih dipadukan panorama puncak Pilatus.',
        category: 'Danau Panorama',
        coordinates: { lat: 47.0028, lng: 8.3082 }
      }
    ]
  },
  {
    id: 'dest-bromo',
    name: 'Bromo & Tumpak Sewu',
    country: 'Indonesia',
    region: 'Jawa Timur',
    category: 'Petualangan',
    tagline: 'Kaldera Matahari Terbit & Air Terjun Tirai',
    description:
      'Saksikan matahari terbit keemasan di atas Kaldera Tengger dengan jip 4WD dan telusuri amfiteater hijau Air Terjun Tumpak Sewu di Jawa Timur.',
    heroImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'Mei – Oktober',
    language: 'Bahasa Indonesia, Jawa, Inggris',
    currency: 'IDR (Rupiah Indonesia)',
    timezone: 'WIB (UTC+7)',
    featured: false,
    mapCenter: { lat: -8.07, lng: 112.935 },
    mapZoom: 10,
    popularAttractions: [
      {
        name: 'Titik Pandang Sunrise Penanjakan',
        description: 'Panorama fajar spektakuler menghadap Gunung Bromo, Batok, dan Semeru.',
        category: 'Gunung Berapi',
        coordinates: { lat: -7.9163, lng: 112.9502 }
      },
      {
        name: 'Air Terjun Tumpak Sewu',
        description: 'Air terjun bertingkat menyerupai tirai raksasa yang dikelilingi tebing tropis Lumajang.',
        category: 'Petualangan',
        coordinates: { lat: -8.2302, lng: 112.9173 }
      }
    ]
  }
];
