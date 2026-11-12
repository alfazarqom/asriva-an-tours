import { TravelPackage } from '../types/travel';

export const PACKAGES_DATA: TravelPackage[] = [
  {
    id: 'pkg-bali-ubud-4d3n',
    slug: 'bali-ubud-nusa-penida-escape-4d3n',
    name: 'Bali Ubud & Nusa Penida Signature Escape',
    description:
      'Perjalanan kurasi 4 hari yang memadukan ketenangan resor Ubud, pura mata air suci, serta ekspedisi kapal cepat privat menyusuri tebing ikonik bagian barat dan timur Nusa Penida.',
    destination: 'Bali & Nusa Penida',
    destinationId: 'dest-bali',
    category: 'Honeymoon',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '4 Hari 3 Malam',
    durationDays: 4,
    price: 5450000,
    discountPrice: 4690000,
    childPriceMultiplier: 0.75,
    infantPriceMultiplier: 0.15,
    rating: 4.9,
    reviewCount: 142,
    highlights: [
      'Penyeberangan fast boat VIP pulang-pergi & tur privat tebing barat Nusa Penida',
      'Menginap di resor Ubud yang asri & hotel butik pesisir Seminyak',
      'Kunjungan wisata budaya ke Tirta Empul & Terasering Sawah Tegalalang',
      'Kendaraan MPV ber-AC privat dengan pengemudi sekaligus pemandu berpengalaman'
    ],
    packageOptions: [
      {
        id: 'opt-4star',
        name: 'Paket Butik Bintang 4 Signature',
        description: 'Resor Bintang 4 Ubud & Hotel Seminyak (Kamar Twin/Double)',
        priceDelta: 0
      },
      {
        id: 'opt-5star-villa',
        name: 'Upgrade Vila Kolam Renang Privat',
        description: 'Private Pool Villa di Ubud + Suite Tepi Pantai Bintang 5 Seminyak',
        priceDelta: 2450000
      }
    ],
    departureDates: ['2026-11-20', '2026-11-27', '2026-12-04', '2026-12-18', '2027-01-08'],
    meetingPoint: 'Pintu Kedatangan Bandara Internasional Ngurah Rai (DPS) / Hotel Bali Selatan',
    departureLocation: 'Denpasar, Bali',
    travelSchedule: 'Hari 1 Tiba sebelum 13:00 WITA • Hari 4 Kepulangan setelah 15:00 WITA',
    accommodationSummary: '2 Malam Resor Ubud Bintang 4 + 1 Malam Hotel Butik Seminyak',
    transportationSummary: 'MPV Privat Ber-AC + Fast Boat VIP PP Sanur–Nusa Penida',
    itinerary: [
      {
        day: 1,
        title: 'Kedatangan di Bali & Penyambutan Budaya Ubud',
        description:
          'Penjemputan privat di bandara oleh tim ASRIVA. Perjalanan menuju Ubud, kunjungan sore ke Terasering Tegalalang, dan makan malam khas Bali.',
        activities: [
          {
            time: '12:30 WITA',
            title: 'Penjemputan VIP di Bandara Ngurah Rai (DPS)',
            detail: 'Meet & greet dengan pengemudi-pemandu privat ber-AC dan kalungan bunga penyambutan.',
            type: 'transport'
          },
          {
            time: '15:00 WITA',
            title: 'Jelajah Terasering Sawah Tegalalang',
            detail: 'Menikmati panorama subak hijau Ubud serta berfoto di spot ikonik dataran tinggi.',
            type: 'sightseeing'
          },
          {
            time: '18:30 WITA',
            title: 'Makan Malam Penyambutan Khas Bali',
            detail: 'Sajian bebek renyah dan hidangan otentik Bali di restoran bernuansa taman Ubud.',
            type: 'meal'
          },
          {
            time: '20:00 WITA',
            title: 'Check-in Resor Butik Ubud',
            detail: 'Istirahat nyaman di resor asri Ubud untuk persiapan tur keesokan hari.',
            type: 'stay'
          }
        ],
        meals: ['Makan Malam'],
        accommodation: 'Resor Butik Ubud (Bintang 4)'
      },
      {
        day: 2,
        title: 'Pura Tirta Empul & Panorama Kaldera Kintamani',
        description:
          'Kunjungan pagi ke mata air suci Tirta Empul, mencicipi kopi agrowisata, dan makan siang menghadap panorama Gunung Batur.',
        activities: [
          {
            time: '07:30 WITA',
            title: 'Sarapan di Resor Ubud',
            type: 'meal'
          },
          {
            time: '09:00 WITA',
            title: 'Wisata Budaya Pura Tirta Empul',
            detail: 'Menyaksikan arsitektur pura bersejarah dan kolam mata air suci Tampaksiring.',
            type: 'sightseeing'
          },
          {
            time: '11:00 WITA',
            title: 'Agrowisata Kopi & Rempah Nusantara',
            detail: 'Sesi mencicipi teh herbal dan kopi sangrai lokal dengan latar lembah tropis.',
            type: 'sightseeing'
          },
          {
            time: '12:30 WITA',
            title: 'Makan Siang Menghadap Gunung & Danau Batur',
            detail: 'Santap siang prasmanan dengan panorama kaldera Kintamani yang sejuk.',
            type: 'meal'
          },
          {
            time: '15:30 WITA',
            title: 'Kembali ke Ubud & Waktu Santai',
            detail: 'Menikmati fasilitas kolam renang atau jalan santai di kawasan seni Ubud.',
            type: 'stay'
          }
        ],
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Resor Butik Ubud (Bintang 4)'
      },
      {
        day: 3,
        title: 'Ekspedisi Pesisir Nusa Penida',
        description:
          'Penyeberangan fast boat pagi dari Sanur ke Nusa Penida. Jelajahi Tebing Kelingking, Broken Beach, dan Angel’s Billabong dengan mobil privat dan makan siang lokal.',
        activities: [
          {
            time: '07:15 WITA',
            title: 'Check-in Pelabuhan Sanur & Fast Boat VIP',
            detail: 'Penyeberangan laut selama ±40 menit menuju Pelabuhan Banjar Nyuh, Nusa Penida.',
            type: 'transport'
          },
          {
            time: '09:30 WITA',
            title: 'Eksplorasi Tebing Kelingking',
            detail: 'Mengagumi formasi tebing karang menyerupai punggung dinosaurus dan lautan biru.',
            type: 'sightseeing'
          },
          {
            time: '12:00 WITA',
            title: 'Makan Siang Restoran Lokal Nusa Penida',
            type: 'meal'
          },
          {
            time: '13:30 WITA',
            title: 'Angel’s Billabong & Broken Beach (Pasih Uug)',
            detail: 'Menikmati kolam laguna alami dan lengkungan karang ikonik pesisir barat.',
            type: 'sightseeing'
          },
          {
            time: '16:30 WITA',
            title: 'Kembali ke Sanur & Check-in Hotel Seminyak',
            detail: 'Transfer menuju kawasan pesisir Seminyak untuk bermalam.',
            type: 'stay'
          }
        ],
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Hotel Pesisir Seminyak (Bintang 4)'
      },
      {
        day: 4,
        title: 'Tebing Uluwatu & Pengantaran Bandara',
        description:
          'Sarapan santai, singgah belanja oleh-oleh di Seminyak, kunjungan tebing Uluwatu, dan pengantaran tepat waktu ke Bandara Ngurah Rai.',
        activities: [
          {
            time: '08:30 WITA',
            title: 'Sarapan & Check-out Hotel Seminyak',
            type: 'meal'
          },
          {
            time: '10:30 WITA',
            title: 'Belanja Oleh-Oleh & Kunjungan Tebing Uluwatu',
            detail: 'Singgah di pusat kerajinan Bali dan menikmati pemandangan Samudra Hindia dari tebing Pura Uluwatu.',
            type: 'sightseeing'
          },
          {
            time: '14:30 WITA',
            title: 'Pengantaran ke Bandara Internasional Ngurah Rai',
            detail: 'Tiba di terminal keberangkatan 2 jam sebelum jadwal penerbangan pulang.',
            type: 'transport'
          }
        ],
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Akomodasi 3 malam (sekamar berdua) termasuk sarapan harian',
      'Kendaraan privat ber-AC & pengemudi merangkap pemandu wisata',
      'Tiket fast boat pulang-pergi Sanur – Nusa Penida – Sanur',
      'Seluruh tiket masuk objek wisata & retribusi pulau Nusa Penida',
      'Konsumsi sesuai jadwal (3x Sarapan, 2x Makan Siang, 1x Makan Malam)',
      'Air mineral selama perjalanan & perlindungan asuransi perjalanan'
    ],
    exclusions: [
      'Tiket pesawat domestik atau internasional dari/ke Bali (DPS)',
      'Pengeluaran pribadi, laundry, minibar, dan layanan spa opsional',
      'Tipping untuk pemandu dan pengemudi (sukarela)'
    ],
    importantNotes: [
      'Medan wisata Nusa Penida memiliki anak tangga batu kapur; disarankan memakai alas kaki yang nyaman.',
      'Harap informasikan alergi makanan atau pantangan diet minimal 48 jam sebelum keberangkatan.'
    ],
    cancellationPolicy: [
      'Perubahan tanggal gratis hingga 14 hari sebelum keberangkatan.',
      'Pengembalian dana 50% untuk pembatalan 7–13 hari sebelum keberangkatan.',
      'Tidak dapat di-refund dalam kurun waktu 6 hari sebelum keberangkatan.'
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Nadia Kartika',
        date: 'Okt 2026',
        rating: 5,
        comment:
          'Ritme perjalanan sangat nyaman dan tidak terburu-buru! Driver selalu datang lebih awal dan penyeberangan ke Nusa Penida sangat lancar.'
      },
      {
        id: 'r2',
        author: 'Dimas Wijaya',
        date: 'Sep 2026',
        rating: 5,
        comment:
          'Memilih opsi upgrade Private Pool Villa untuk ulang tahun pernikahan kami dan pelayanannya luar biasa memuaskan.'
      }
    ],
    availability: 10,
    minTravelers: 2,
    maxTravelers: 12,
    featured: true,
    recommended: true,
    specialOffer: true
  },
  {
    id: 'pkg-komodo-phinisi-3d2n',
    slug: 'komodo-luxury-phinisi-sailing-3d2n',
    name: 'Pelayaran Phinisi Komodo & Pulau Padar',
    description:
      'Berlayar melintasi selat biru kehijauan Taman Nasional Komodo di atas kapal Phinisi kayu mewah. Mendaki Pulau Padar saat matahari terbit, bertemu komodo, dan snorkeling bersama pari manta.',
    destination: 'Labuan Bajo & Komodo',
    destinationId: 'dest-labuan-bajo',
    category: 'Tur Domestik',
    images: [
      'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '3 Hari 2 Malam',
    durationDays: 3,
    price: 6200000,
    discountPrice: 5590000,
    childPriceMultiplier: 0.8,
    infantPriceMultiplier: 0.1,
    rating: 4.9,
    reviewCount: 98,
    highlights: [
      'Pelayaran liveaboard 3H2M di atas kapal Phinisi kayu deluxe ber-AC',
      'Pendakian matahari terbit di Pulau Padar menghadap tiga teluk berwarna',
      'Jelajah satwa komodo bersama ranger & snorkeling bersama ikan pari manta',
      'Sajian makanan lengkap di atas kapal & antar-jemput bandara–pelabuhan'
    ],
    packageOptions: [
      {
        id: 'opt-deluxe-cabin',
        name: 'Kabin Ensuite Dek Bawah',
        description: 'Kabin privat ber-AC dengan kamar mandi dalam (Twin/Double)',
        priceDelta: 0
      },
      {
        id: 'opt-master-ocean',
        name: 'Master Suite Ocean-View Dek Atas',
        description: 'Kabin panorama laut luas dengan akses balkon privat',
        priceDelta: 1650000
      }
    ],
    departureDates: ['2026-11-21', '2026-11-28', '2026-12-05', '2026-12-19', '2027-01-15'],
    meetingPoint: 'Bandara Komodo (LBJ) atau Dermaga Pelabuhan Labuan Bajo',
    departureLocation: 'Labuan Bajo, Flores',
    travelSchedule: 'Hari 1 Boarding 10:30 WITA • Hari 3 Sandar Kembali 12:30 WITA',
    accommodationSummary: '2 Malam Kabin Ber-AC Kamar Mandi Dalam di Kapal Phinisi Deluxe',
    transportationSummary: 'Kapal Phinisi Deluxe + Sekoci Cepat + Antar-Jemput Bandara',
    itinerary: [
      {
        day: 1,
        title: 'Pulau Kelor, Manjarite & Matahari Terbenam Kalong',
        description:
          'Penjemputan bandara dan boarding kapal. Mendaki bukit Pulau Kelor, snorkeling di taman karang Manjarite, dan menikmati senja ribuan kelelawar di Pulau Kalong.',
        activities: [
          {
            time: '10:00 WITA',
            title: 'Penjemputan Bandara Komodo & Boarding Phinisi',
            detail: 'Briefing keselamatan oleh kapten kapal serta pembagian kabin ber-AC.',
            type: 'transport'
          },
          {
            time: '12:00 WITA',
            title: 'Pendakian Bukit Pulau Kelor & Makan Siang',
            detail: 'Menikmati panorama gugusan pulau Flores dari puncak Kelor lalu makan siang di dek.',
            type: 'sightseeing'
          },
          {
            time: '14:30 WITA',
            title: 'Snorkeling Terumbu Karang Manjarite',
            detail: 'Berenang di perairan tenang berair jernih dengan beragam ikan karang warna-warni.',
            type: 'sightseeing'
          },
          {
            time: '17:45 WITA',
            title: 'Sunset Pulau Kalong & Makan Malam di Kapal',
            detail: 'Menyaksikan ribuan kelelawar terbang saat senja sebelum makan malam hidangan laut.',
            type: 'stay'
          }
        ],
        meals: ['Makan Siang', 'Makan Malam'],
        accommodation: 'Kabin Ensuite Phinisi Deluxe'
      },
      {
        day: 2,
        title: 'Sunrise Padar, Pink Beach, Komodo & Manta Point',
        description:
          'Trekking fajar di Pulau Padar, berenang di Long Pink Beach, trekking bersama ranger di Pulau Komodo, dan snorkeling pari manta di Taka Makassar.',
        activities: [
          {
            time: '05:15 WITA',
            title: 'Sunrise Trekking Puncak Pulau Padar',
            detail: 'Menyaksikan matahari terbit di atas tiga teluk ikonik berpasir putih, hitam, dan merah muda.',
            type: 'sightseeing'
          },
          {
            time: '08:30 WITA',
            title: 'Sarapan di Kapal & Bersantai di Long Pink Beach',
            detail: 'Menikmati pasir pantai kemerahan yang langka dan berenang di teluk yang tenang.',
            type: 'meal'
          },
          {
            time: '11:00 WITA',
            title: 'Jelajah Habitat Komodo bersama Ranger',
            detail: 'Trekking aman di Taman Nasional Komodo untuk melihat komodo di alam liar.',
            type: 'sightseeing'
          },
          {
            time: '14:30 WITA',
            title: 'Snorkeling Manta Point & Taka Makassar',
            detail: 'Berenang bersama pari manta dan bersantai di gosong pasir putih tengah laut.',
            type: 'sightseeing'
          },
          {
            time: '19:00 WITA',
            title: 'Makan Malam BBQ & Bermalam di Teluk Tenang',
            type: 'stay'
          }
        ],
        meals: ['Sarapan', 'Makan Siang', 'Makan Malam'],
        accommodation: 'Kabin Ensuite Phinisi Deluxe'
      },
      {
        day: 3,
        title: 'Terumbu Karang Sebayur & Kembali ke Labuan Bajo',
        description:
          'Snorkeling pagi di Pulau Sebayur, sarapan santai di dek kapal, berlayar kembali ke pelabuhan Labuan Bajo, dan pengantaran ke bandara.',
        activities: [
          {
            time: '07:30 WITA',
            title: 'Sarapan di Dek Kapal Menghadap Laut',
            type: 'meal'
          },
          {
            time: '09:00 WITA',
            title: 'Snorkeling Penutup di Pulau Sebayur',
            detail: 'Menikmati sesi renang terakhir di taman karang dangkal yang jernih.',
            type: 'sightseeing'
          },
          {
            time: '12:00 WITA',
            title: 'Sandar di Pelabuhan & Transfer Bandara (LBJ)',
            detail: 'Makan siang ringan sebelum pengantaran menuju Bandara Komodo untuk penerbangan pulang.',
            type: 'transport'
          }
        ],
        meals: ['Sarapan', 'Makan Siang']
      }
    ],
    inclusions: [
      '2 malam menginap di kabin ber-AC dengan kamar mandi dalam',
      'Makan lengkap selama pelayaran (7x makan utama + camilan sore)',
      'Perlengkapan snorkeling (masker, snorkel, fin) dan pelampung keselamatan',
      'Antar-jemput bandara–pelabuhan Labuan Bajo & tour leader bersertifikat'
    ],
    exclusions: [
      'Tiket masuk Taman Nasional Komodo & jasa ranger (dibayar di lokasi sesuai tarif resmi)',
      'Tiket pesawat dari/ke Bandara Komodo (LBJ)',
      'Minuman beralkohol dan pengeluaran pribadi'
    ],
    importantNotes: [
      'Rute pelayaran dapat menyesuaikan secara dinamis demi keselamatan sesuai arahan Syahbandar.',
      'Disarankan membawa tabir surya ramah terumbu karang, kacamata hitam, dan obat pribadi.'
    ],
    cancellationPolicy: [
      'Penjadwalan ulang diperbolehkan hingga 14 hari sebelum tanggal berlayar.',
      'Penutupan pelabuhan akibat cuaca berhak atas voucher kredit penuh atau jadwal ulang.'
    ],
    reviews: [
      {
        id: 'r3',
        author: 'Rendra Pratama',
        date: 'Okt 2026',
        rating: 5,
        comment:
          'Kru kapal Phinisi sangat ramah dan profesional. Makan malam hidangan laut segar di bawah bintang sungguh tak terlupakan.'
      }
    ],
    availability: 8,
    minTravelers: 1,
    maxTravelers: 10,
    featured: true,
    recommended: true
  },
  {
    id: 'pkg-japan-golden-7d6n',
    slug: 'japan-golden-route-tokyo-fuji-kyoto-7d6n',
    name: 'Rute Emas Jepang: Tokyo, Gunung Fuji & Kyoto',
    description:
      'Jelajahi jantung budaya Jepang dan ikon modern dalam 7 hari yang tertata nyaman. Termasuk pengalaman kereta cepat Shinkansen, panorama Gunung Fuji, dan tur kuil bersejarah Kyoto.',
    destination: 'Tokyo & Kyoto',
    destinationId: 'dest-kyoto-tokyo',
    category: 'Tur Internasional',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '7 Hari 6 Malam',
    durationDays: 7,
    price: 21800000,
    discountPrice: 19950000,
    childPriceMultiplier: 0.85,
    infantPriceMultiplier: 0.2,
    rating: 4.8,
    reviewCount: 76,
    highlights: [
      'Tiket kereta cepat Tokaido Shinkansen terpesan dari Odawara ke Kyoto',
      '1 malam menginap di resor pemandian air panas Hakone Onsen + makan malam Kaiseki',
      'Eksplorasi terpandu Fushimi Inari, Hutan Bambu Arashiyama & Kinkaku-ji',
      'Wisata Gunung Fuji Stasiun ke-5 & Danau Kawaguchiko'
    ],
    packageOptions: [
      {
        id: 'opt-standard-japan',
        name: 'Hotel Kota Bintang 4 Standar',
        description: 'Hotel bintang 4 strategis dekat stasiun transportasi utama',
        priceDelta: 0
      },
      {
        id: 'opt-premium-japan',
        name: 'Hotel Deluxe Pusat Kota Premier',
        description: 'Upgrade kamar lebih luas di jantung Shinjuku & Pusat Kota Kyoto',
        priceDelta: 3800000
      }
    ],
    departureDates: ['2026-12-02', '2026-12-16', '2027-01-20', '2027-03-24'],
    meetingPoint: 'Aula Kedatangan Terminal 1 Bandara Internasional Narita (NRT)',
    departureLocation: 'Tokyo (NRT) / Kepulangan Osaka (KIX)',
    travelSchedule: 'Hari 1 Tiba di Tokyo • Hari 7 Kepulangan Bandara Internasional Kansai',
    accommodationSummary: '3 Malam Hotel Tokyo + 1 Malam Resor Hakone Onsen + 2 Malam Hotel Kyoto',
    transportationSummary: 'Bus Wisata Privat + Tiket Kereta Cepat Shinkansen',
    itinerary: [
      {
        day: 1,
        title: 'Tiba di Tokyo & Orientasi Malam Shinjuku',
        description:
          'Bertemu koordinator tur ASRIVA di Bandara Narita, transfer ke hotel pusat Tokyo, dan jalan santai malam di distrik Shinjuku.',
        activities: [
          {
            time: '15:00 JST',
            title: 'Penjemputan di Bandara Narita (NRT) & Transfer Tokyo',
            detail: 'Koordinator tur membantu aktivasi kartu transportasi dan pengantaran menuju hotel.',
            type: 'transport'
          },
          {
            time: '18:30 JST',
            title: 'Check-in Hotel & Jalan Malam Distrik Shinjuku',
            detail: 'Melihat gemerlap neon Shinjuku serta menyantap makan malam penyambutan.',
            type: 'meal'
          }
        ],
        meals: ['Makan Malam'],
        accommodation: 'Shinjuku Granbell atau setaraf (Bintang 4)'
      },
      {
        day: 2,
        title: 'Asakusa Senso-ji, Kuil Meiji & Shibuya',
        description:
          'Tur kota Tokyo seharian mengunjungi Kuil Senso-ji, Nakamise Street, Kuil hutan Meiji Jingu, dan persimpangan Shibuya.',
        activities: [
          {
            time: '08:30 JST',
            title: 'Kuil Senso-ji & Jalan Belanja Nakamise',
            detail: 'Mengunjungi kuil tertua di Tokyo dengan lampion raksasa Kaminarimon.',
            type: 'sightseeing'
          },
          {
            time: '12:30 JST',
            title: 'Makan Siang Khas Jepang & Kuil Meiji Jingu',
            detail: 'Menikmati suasana hutan teduh di tengah Tokyo tepat di sebelah kawasan Harajuku.',
            type: 'meal'
          },
          {
            time: '16:00 JST',
            title: 'Shibuya Crossing & Patung Hachiko',
            detail: 'Waktu bebas berfoto dan berbelanja di distrik mode paling ikonik di Tokyo.',
            type: 'sightseeing'
          }
        ],
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Shinjuku Granbell atau setaraf (Bintang 4)'
      },
      {
        day: 3,
        title: 'Gunung Fuji Stasiun ke-5 & Danau Kawaguchiko',
        description:
          'Perjalanan ke Stasiun ke-5 Gunung Fuji (menyesuaikan cuaca), mata air Oshino Hakkai, dan makan malam Kaiseki di Hakone.',
        activities: [
          {
            time: '08:00 JST',
            title: 'Berangkat Menuju Kawasan Gunung Fuji',
            detail: 'Perjalanan bus wisata privat melalui jalan tol pegunungan menuju Yamanashi.',
            type: 'transport'
          },
          {
            time: '10:30 JST',
            title: 'Gunung Fuji Stasiun ke-5 & Oshino Hakkai',
            detail: 'Menikmati udara pegunungan dan desa mata air bening berlatar Gunung Fuji.',
            type: 'sightseeing'
          },
          {
            time: '17:30 JST',
            title: 'Check-in Ryokan Hakone Onsen & Makan Malam Kaiseki',
            detail: 'Pengalaman bersantap multi-hidangan tradisional dan berendam air panas alami.',
            type: 'stay'
          }
        ],
        meals: ['Sarapan', 'Makan Siang', 'Makan Malam'],
        accommodation: 'Resor Ryokan Hakone Onsen'
      },
      {
        day: 4,
        title: 'Kereta Cepat Shinkansen ke Kyoto & Fushimi Inari',
        description:
          'Menaiki kereta peluru Shinkansen ke Kyoto, menjelajahi gerbang merah Fushimi Inari Taisha dan distrik bersejarah Gion.',
        activities: [
          {
            time: '09:30 JST',
            title: 'Perjalanan Kereta Cepat Tokaido Shinkansen',
            detail: 'Meluncur dengan kecepatan hingga 285 km/jam dari Stasiun Odawara menuju Kyoto.',
            type: 'transport'
          },
          {
            time: '13:30 JST',
            title: 'Eksplorasi Ribuan Gerbang Fushimi Inari Taisha',
            detail: 'Berjalan di koridor gerbang torii merah ikonik di lereng Gunung Inari.',
            type: 'sightseeing'
          },
          {
            time: '18:00 JST',
            title: 'Jalan Sore Distrik Gion & Check-in Hotel Kyoto',
            detail: 'Menelusuri kawasan rumah kayu tradisional Hanamikoji di pusat kota tua Kyoto.',
            type: 'stay'
          }
        ],
        meals: ['Sarapan', 'Makan Malam'],
        accommodation: 'Hotel Butik Kyoto (Bintang 4)'
      },
      {
        day: 5,
        title: 'Hutan Bambu Arashiyama & Paviliun Emas Kinkaku-ji',
        description: 'Jalan pagi menyusuri Hutan Bambu Sagano, taman Tenryu-ji, dan kuil keemasan Kinkaku-ji.',
        activities: [
          {
            time: '08:30 JST',
            title: 'Hutan Bambu Sagano & Jembatan Togetsukyo',
            detail: 'Suasana pagi yang tenang di antara rumpun bambu menjulang di Arashiyama.',
            type: 'sightseeing'
          },
          {
            time: '12:00 JST',
            title: 'Makan Siang Lokal Kyoto & Taman Tenryu-ji',
            type: 'meal'
          },
          {
            time: '14:30 JST',
            title: 'Kuil Paviliun Emas Kinkaku-ji',
            detail: 'Mengagumi bangunan kuil berlapis emas yang memantul indah di atas kolam cermin.',
            type: 'sightseeing'
          }
        ],
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Hotel Butik Kyoto (Bintang 4)'
      },
      {
        day: 6,
        title: 'Taman Rusa Nara & Wisata Kuliner Osaka Dotonbori',
        description: 'Kunjungan ke Kuil Todai-ji di Nara dilanjutkan wisata kuliner jalanan di kawasan Osaka Dotonbori.',
        activities: [
          {
            time: '09:00 JST',
            title: 'Taman Rusa Nara & Kuil Todai-ji',
            detail: 'Berinteraksi dengan rusa jinak serta melihat patung Buddha perunggu raksasa.',
            type: 'sightseeing'
          },
          {
            time: '14:30 JST',
            title: 'Eksplorasi Kuliner & Belanja Osaka Dotonbori',
            detail: 'Berfoto di papan neon Glico Man dan mencicipi takoyaki maupun okonomiyaki.',
            type: 'meal'
          },
          {
            time: '19:30 JST',
            title: 'Kembali ke Hotel Kyoto & Persiapan Bagasi',
            type: 'stay'
          }
        ],
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Hotel Butik Kyoto (Bintang 4)'
      },
      {
        day: 7,
        title: 'Kepulangan Bandara Internasional Kansai',
        description:
          'Sarapan di hotel dan pengantaran terjadwal menuju Bandara Internasional Kansai (KIX) untuk penerbangan pulang.',
        activities: [
          {
            time: '07:30 JST',
            title: 'Sarapan & Check-out Hotel Kyoto',
            type: 'meal'
          },
          {
            time: '09:30 JST',
            title: 'Transfer Menuju Bandara Internasional Kansai (KIX)',
            detail: 'Pengantaran nyaman sesuai jadwal penerbangan internasional kembali ke tanah air.',
            type: 'transport'
          }
        ],
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Akomodasi 6 malam bintang 4 termasuk 1 malam di Hakone Onsen',
      'Tiket kereta cepat Shinkansen terpesan (Odawara – Kyoto)',
      'Bus wisata privat & pemandu wisata berlisensi berbahasa Indonesia/Inggris',
      'Sarapan harian + 4x makan siang + 3x makan malam'
    ],
    exclusions: [
      'Tiket pesawat internasional dan biaya pengurusan Visa / Visa Waiver Jepang',
      'Asuransi perjalanan (wajib untuk keberangkatan internasional)',
      'Belanja pribadi dan aktivitas opsional'
    ],
    importantNotes: [
      'Paspor wajib memiliki masa berlaku minimal 6 bulan dari tanggal kepulangan.',
      'Koper besar dikirim terpisah pada hari perjalanan Shinkansen; siapkan tas kecil untuk menginap 1 malam di Hakone.'
    ],
    cancellationPolicy: [
      'Pembatalan 21+ hari sebelumnya: pengembalian 85% dikurangi deposit tiket kereta/ryokan.',
      'Pembatalan dalam 20 hari: mengikuti ketentuan retensi mitra hotel dan transportasi.'
    ],
    reviews: [
      {
        id: 'r4',
        author: 'Siti Rahmawati',
        date: 'Sep 2026',
        rating: 5,
        comment:
          'Jadwal sangat pas untuk keluarga kami berempat. Naik Shinkansen dan menginap di Hakone Onsen menjadi pengalaman terbaik.'
      }
    ],
    availability: 14,
    minTravelers: 2,
    maxTravelers: 16,
    featured: true,
    specialOffer: true
  },
  {
    id: 'pkg-bromo-sewu-3d2n',
    slug: 'bromo-sunrise-tumpak-sewu-expedition-3d2n',
    name: 'Ekspedisi Privat Sunrise Bromo & Tumpak Sewu',
    description:
      'Petualangan dataran tinggi Jawa Timur yang dirancang bagi pencinta alam dan fotografi. Taklukkan lautan pasir Bromo dengan jip 4WD dan jelajahi ngarai eksotis Air Terjun Tumpak Sewu.',
    destination: 'Bromo & Tumpak Sewu',
    destinationId: 'dest-bromo',
    category: 'Petualangan',
    images: [
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '3 Hari 2 Malam',
    durationDays: 3,
    price: 3350000,
    discountPrice: 2890000,
    childPriceMultiplier: 0.85,
    infantPriceMultiplier: 0.1,
    rating: 4.8,
    reviewCount: 119,
    highlights: [
      'Tur sunrise jip Toyota Land Cruiser 4WD privat menuju Bukit King Kong',
      'Trekking ngarai terpandu ke dasar Air Terjun Tumpak Sewu & Goa Tetes',
      'Transportasi darat privat Innova Reborn dari Surabaya atau Malang',
      '2 malam menginap di penginapan pegunungan & hotel area kawah Bromo'
    ],
    packageOptions: [
      {
        id: 'opt-private-standard',
        name: 'Ekspedisi Privat (Penginapan Nyaman)',
        description: 'Jip 4WD Privat + Akomodasi Pegunungan Pilihan',
        priceDelta: 0
      },
      {
        id: 'opt-private-jiwajawa',
        name: 'Ekspedisi Privat (Resor Jiwa Jawa)',
        description: 'Upgrade menginap di Jiwa Jawa Resort Bromo + Pemandu Fotografi',
        priceDelta: 1150000
      }
    ],
    departureDates: ['2026-11-20', '2026-11-27', '2026-12-11', '2026-12-25', '2027-01-09'],
    meetingPoint: 'Bandara Internasional Juanda (SUB) / Stasiun Surabaya Gubeng',
    departureLocation: 'Surabaya / Malang, Jawa Timur',
    travelSchedule: 'Hari 1 Penjemputan 09:00 WIB • Hari 3 Pengantaran Surabaya 16:00 WIB',
    accommodationSummary: '1 Malam Eco-Lodge Tumpak Sewu + 1 Malam Hotel Kawasan Bromo',
    transportationSummary: 'Toyota Innova Reborn Privat + Jip Hardtop 4WD',
    itinerary: [
      {
        day: 1,
        title: 'Kedatangan Surabaya & Perjalanan ke Dataran Tinggi Lumajang',
        description:
          'Penjemputan di Surabaya, perjalanan melintasi pegunungan Malang menuju desa Pronojiwo di dekat Tumpak Sewu.',
        activities: [
          {
            time: '09:00 WIB',
            title: 'Penjemputan di Bandara Juanda / Stasiun Gubeng',
            detail: 'Berangkat menggunakan Toyota Innova Reborn privat menuju kawasan selatan Lumajang.',
            type: 'transport'
          },
          {
            time: '13:00 WIB',
            title: 'Makan Siang Rute Malang & Panorama Semeru',
            detail: 'Beristirahat menyantap hidangan khas Jawa Timur dengan latar lereng Gunung Semeru.',
            type: 'meal'
          },
          {
            time: '16:30 WIB',
            title: 'Check-in Eco-Lodge Pronojiwo & Makan Malam',
            detail: 'Persiapan fisik serta briefing perlengkapan trekking esok pagi.',
            type: 'stay'
          }
        ],
        meals: ['Makan Siang', 'Makan Malam'],
        accommodation: 'Penginapan Pegunungan Pronojiwo'
      },
      {
        day: 2,
        title: 'Trekking Air Terjun Tumpak Sewu & Menuju Bromo',
        description:
          'Turun ke dasar air terjun Tumpak Sewu bersama pemandu lokal, eksplorasi Goa Tetes, dan perjalanan sore ke Cemoro Lawang Bromo.',
        activities: [
          {
            time: '06:30 WIB',
            title: 'Spot Panorama & Trekking Dasar Tumpak Sewu',
            detail: 'Menikmati tirai ratusan air terjun dari atas lalu menyusuri ngarai sungai hingga ke dasar.',
            type: 'sightseeing'
          },
          {
            time: '10:30 WIB',
            title: 'Eksplorasi Goa Tetes & Telaga Biru',
            detail: 'Menelusuri formasi stalaktit dan air terjun bertingkat sebelum kembali ke pos awal.',
            type: 'sightseeing'
          },
          {
            time: '13:00 WIB',
            title: 'Makan Siang & Perjalanan ke Cemoro Lawang Bromo',
            type: 'transport'
          },
          {
            time: '18:00 WIB',
            title: 'Check-in Hotel Kawasan Kawah Bromo',
            detail: 'Istirahat lebih awal menjelang keberangkatan tur sunrise dini hari.',
            type: 'stay'
          }
        ],
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Bromo Lava View / Jiwa Jawa Resort'
      },
      {
        day: 3,
        title: 'Sunrise Bromo 4WD, Kawah Bromo & Kepulangan',
        description:
          '03:00 WIB berangkat dengan jip 4WD ke Bukit King Kong, melintasi Lautan Pasir, mendaki tangga kawah Bromo, sarapan, dan kembali ke Surabaya.',
        activities: [
          {
            time: '03:00 WIB',
            title: 'Tur Jip 4WD Menuju Bukit King Kong / Penanjakan',
            detail: 'Menunggu momen matahari terbit berlatar kaldera Tengger, Gunung Batok, dan Semeru.',
            type: 'sightseeing'
          },
          {
            time: '06:30 WIB',
            title: 'Lautan Pasir, Pura Luhur Poten & Kawah Bromo',
            detail: 'Melintasi padang pasir vulkanik dan mendaki 250 anak tangga menuju bibir kawah.',
            type: 'sightseeing'
          },
          {
            time: '09:00 WIB',
            title: 'Sarapan di Hotel & Perjalanan Kembali ke Surabaya',
            detail: 'Check-out dan pengantaran langsung ke Bandara Juanda atau Stasiun Surabaya.',
            type: 'transport'
          }
        ],
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Kendaraan privat, BBM, tol, dan pengemudi berpengalaman rute pegunungan',
      'Sewa Jip 4WD privat untuk tur matahari terbit Bromo',
      '2 malam akomodasi pegunungan termasuk sarapan',
      'Pemandu trekking lokal air terjun & seluruh tiket masuk taman nasional'
    ],
    exclusions: [
      'Sewa kuda di Lautan Pasir Gunung Bromo',
      'Tiket pesawat atau kereta api dari/ke Surabaya',
      'Perlengkapan pakaian dingin pribadi dan tipping'
    ],
    importantNotes: [
      'Suhu pagi hari di Bromo berkisar antara 5°C–10°C; harap membawa jaket tebal tahan angin.',
      'Rute Tumpak Sewu melewati aliran sungai dan tangga bambu; wajib mengenakan sandal gunung atau sepatu anti-selip.'
    ],
    cancellationPolicy: [
      'Perubahan jadwal gratis hingga 7 hari sebelum keberangkatan.',
      'Biaya pembatalan 50% dalam kurun waktu 3–6 hari sebelum keberangkatan.'
    ],
    reviews: [
      {
        id: 'r5',
        author: 'Bagus Setiawan',
        date: 'Okt 2026',
        rating: 5,
        comment:
          'Cuaca di Tumpak Sewu dan Bromo sangat cerah. Dengan jip privat, perjalanan kami jauh lebih fleksibel tanpa menunggu rombongan lain.'
      }
    ],
    availability: 6,
    minTravelers: 2,
    maxTravelers: 8,
    recommended: true
  },
  {
    id: 'pkg-swiss-alpine-6d5n',
    slug: 'swiss-alps-scenic-rail-lucerne-jungfrau-6d5n',
    name: 'Kereta Panorama Alpen Swiss: Zurich, Lucerne & Jungfrau',
    description:
      'Lintasi danau ikonik dan puncak bersalju Swiss dengan konektivitas Swiss Travel Pass, perjalanan Gunung Pilatus, dan ekskursi tak terlupakan ke puncak Jungfraujoch.',
    destination: 'Pegunungan Alpen Swiss & Lucerne',
    destinationId: 'dest-swiss',
    category: 'Liburan Keluarga',
    images: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '6 Hari 5 Malam',
    durationDays: 6,
    price: 34500000,
    childPriceMultiplier: 0.7,
    infantPriceMultiplier: 0.15,
    rating: 5.0,
    reviewCount: 41,
    highlights: [
      'Swiss Travel Pass 6 hari berturut-turut untuk kereta, kapal danau & bus',
      'Ekskursi Jungfraujoch – Top of Europe melalui gondola Eiger Express',
      'Perjalanan Golden Round Trip Gunung Pilatus melintasi Danau Lucerne',
      '2 malam hotel tepi danau Lucerne & 3 malam hotel Alpen Interlaken'
    ],
    packageOptions: [
      {
        id: 'opt-swiss-2nd',
        name: 'Kereta Swiss Kelas 2 + Hotel Bintang 4',
        description: 'Swiss Travel Pass Kelas 2 (6 Hari) + Akomodasi Bintang 4',
        priceDelta: 0
      },
      {
        id: 'opt-swiss-1st',
        name: 'Upgrade Kereta Panorama Kelas 1',
        description: 'Gerbong Panorama Kelas 1 + Kamar Pemandangan Danau',
        priceDelta: 4900000
      }
    ],
    departureDates: ['2026-12-10', '2027-01-14', '2027-02-18', '2027-05-12'],
    meetingPoint: 'Stasiun Kereta Bandara Zurich (ZRH)',
    departureLocation: 'Zurich, Swiss',
    travelSchedule: 'Hari 1 Tiba di Zurich • Hari 6 Kereta Kembali ke Bandara Zurich',
    accommodationSummary: '2 Malam Hotel Tepi Danau Lucerne + 3 Malam Hotel Alpen Interlaken',
    transportationSummary: 'Swiss Travel Pass + Gondola Eiger Express & Kereta Bergerigi',
    itinerary: [
      {
        day: 1,
        title: 'Kedatangan Zurich & Kereta Panorama ke Lucerne',
        description:
          'Perjalanan kereta langsung dari Bandara Zurich menuju Lucerne. Jalan santai melewati Jembatan Kapel dan Kota Tua.',
        activities: [
          {
            time: '11:30 CET',
            title: 'Aktivasi Swiss Travel Pass & Kereta ke Lucerne',
            detail: 'Perjalanan kereta langsung ±1 jam menyusuri pedesaan dan danau Swiss.',
            type: 'transport'
          },
          {
            time: '15:00 CET',
            title: 'Jalan Santai Jembatan Kapel & Kota Tua Lucerne',
            detail: 'Mengagumi jembatan kayu abad ke-14 dan Monumen Singa Lucerne.',
            type: 'sightseeing'
          },
          {
            time: '19:00 CET',
            title: 'Makan Malam Penyambutan & Check-in Hotel Tepi Danau',
            type: 'stay'
          }
        ],
        meals: ['Makan Malam'],
        accommodation: 'Hotel des Balances atau setaraf (Bintang 4)'
      },
      {
        day: 2,
        title: 'Golden Round Trip Gunung Pilatus',
        description:
          'Pelayaran kapal uap di Danau Lucerne, kereta bergerigi tercuram di dunia menuju Pilatus Kulm, dan turun dengan kereta gantung.',
        activities: [
          {
            time: '09:00 CET',
            title: 'Pelayaran Kapal Danau Lucerne Menuju Alpnachstad',
            type: 'transport'
          },
          {
            time: '10:30 CET',
            title: 'Kereta Bergerigi Tercuram Menuju Puncak Pilatus Kulm',
            detail: 'Menikmati panorama 360 derajat jajaran pegunungan Alpen Swiss dari ketinggian 2.132 mdpl.',
            type: 'sightseeing'
          },
          {
            time: '15:00 CET',
            title: 'Turun dengan Kereta Gantung Dragon Ride ke Kriens',
            detail: 'Kembali ke Lucerne dan waktu bebas di sepanjang tepi Sungai Reuss.',
            type: 'stay'
          }
        ],
        meals: ['Sarapan'],
        accommodation: 'Hotel des Balances atau setaraf (Bintang 4)'
      },
      {
        day: 3,
        title: 'Kereta Panorama Lucerne–Interlaken Express',
        description: 'Menaiki kereta panorama melintasi jalur Brünig Pass melewati lima danau Alpen menuju Interlaken.',
        activities: [
          {
            time: '10:06 CET',
            title: 'Lucerne–Interlaken Express Berjendela Panorama',
            detail: 'Menyaksikan air terjun pegunungan dan lima danau jernih sepanjang jalur Brünig Pass.',
            type: 'transport'
          },
          {
            time: '14:00 CET',
            title: 'Check-in Hotel Interlaken & Naik Harder Kulm (Opsional)',
            detail: 'Berjalan di taman Höhematte berlatar puncak Jungfrau berselimut salju.',
            type: 'stay'
          }
        ],
        meals: ['Sarapan'],
        accommodation: 'Hotel Butik Alpen Interlaken (Bintang 4)'
      },
      {
        day: 4,
        title: 'Ekskursi Jungfraujoch – Top of Europe',
        description:
          'Naik melalui gondola Eiger Express dan kereta Jungfrau menuju Istana Es dan Observatorium Sphinx di ketinggian 3.454 mdpl.',
        activities: [
          {
            time: '08:30 CET',
            title: 'Gondola Eiger Express Menuju Stasiun Gletser Eiger',
            detail: 'Koneksi modern melintasi dinding utara Pegunungan Eiger menuju jalur kereta terowongan.',
            type: 'transport'
          },
          {
            time: '10:30 CET',
            title: 'Istana Es, Dataran Salju & Observatorium Sphinx',
            detail: 'Eksplorasi gletser Aletsch terpanjang di Alpen dan menikmati makan siang Alpen.',
            type: 'sightseeing'
          },
          {
            time: '16:30 CET',
            title: 'Perjalanan Turun via Lembah Grindelwald',
            type: 'stay'
          }
        ],
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Hotel Butik Alpen Interlaken (Bintang 4)'
      },
      {
        day: 5,
        title: 'Lembah Lauterbrunnen & Pelayaran Danau Brienz',
        description: 'Menjelajahi lembah 72 air terjun Lauterbrunnen dan menikmati pelayaran sore di Danau Brienz yang jernih.',
        activities: [
          {
            time: '09:30 CET',
            title: 'Desa Lembah Lauterbrunnen & Air Terjun Staubbach',
            detail: 'Mengunjungi lembah tebing kapur yang memukau serta desa bebas mobil Wengen/Mürren.',
            type: 'sightseeing'
          },
          {
            time: '14:30 CET',
            title: 'Pelayaran Kapal Danau Brienz Warna Toska',
            detail: 'Berlayar santai melewati Air Terjun Giessbach dan kembali ke Interlaken.',
            type: 'sightseeing'
          }
        ],
        meals: ['Sarapan'],
        accommodation: 'Hotel Butik Alpen Interlaken (Bintang 4)'
      },
      {
        day: 6,
        title: 'Kepulangan Menuju Bandara Zurich',
        description: 'Sarapan di hotel dan koneksi kereta langsung menuju Bandara Zurich untuk penerbangan internasional pulang.',
        activities: [
          {
            time: '08:00 CET',
            title: 'Sarapan Prasmanan & Check-out Hotel',
            type: 'meal'
          },
          {
            time: '10:00 CET',
            title: 'Kereta Langsung Interlaken ke Bandara Zurich (ZRH)',
            detail: 'Pengaturan bagasi mudah menuju terminal keberangkatan internasional Zurich.',
            type: 'transport'
          }
        ],
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Akomodasi 5 malam hotel bintang 4 di Swiss termasuk sarapan prasmanan harian',
      'Swiss Travel Pass 6 hari berturut-turut (jaringan kereta, bus & kapal)',
      'Tiket reservasi pulang-pergi ekskursi gunung ke Jungfraujoch & Gunung Pilatus',
      'Makan malam penyambutan di Lucerne & makan siang Alpen di Jungfraujoch'
    ],
    exclusions: [
      'Tiket penerbangan internasional dari/ke Zurich (ZRH)',
      'Biaya pengurusan Visa Schengen & asuransi perjalanan wajib',
      'Pajak turis kota (sekitar CHF 3,50–4,50 per orang/malam dibayar saat check-in hotel)'
    ],
    importantNotes: [
      'Pemegang paspor Indonesia wajib memiliki Visa Schengen yang masih berlaku.',
      'Kacamata hitam dan pakaian hangat berlapis sangat diperlukan di Jungfraujoch sepanjang tahun.'
    ],
    cancellationPolicy: [
      'Tiket kereta pegunungan tidak dapat di-refund setelah diterbitkan.',
      'Komponen hotel mengikuti ketentuan pembatalan minimal 21 hari sebelumnya.'
    ],
    reviews: [
      {
        id: 'r6',
        author: 'Hendro & Keluarga',
        date: 'Agu 2026',
        rating: 5,
        comment:
          'Ketepatan waktu kereta Swiss dipadukan dengan voucher digital dari ASRIVA membuat perjalanan bersama anak-anak sangat praktis.'
      }
    ],
    availability: 8,
    minTravelers: 2,
    maxTravelers: 10,
    featured: true
  },
  {
    id: 'pkg-bali-group-corporate-3d2n',
    slug: 'bali-south-coast-cultural-group-tour-3d2n',
    name: 'Tur Grup Eksplorasi Budaya & Pesisir Bali',
    description:
      'Paket tur grup 3 hari bernilai hemat mencakup wisata bahari Tanjung Benoa, Taman Budaya Garuda Wisnu Kencana, makan malam hidangan laut Jimbaran, dan Pura Tanah Lot.',
    destination: 'Bali & Nusa Penida',
    destinationId: 'dest-bali',
    category: 'Tur Grup',
    images: [
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '3 Hari 2 Malam',
    durationDays: 3,
    price: 2950000,
    discountPrice: 2490000,
    childPriceMultiplier: 0.75,
    infantPriceMultiplier: 0.1,
    rating: 4.7,
    reviewCount: 205,
    highlights: [
      'Gratis 1x permainan Banana Boat di Pantai Tanjung Benoa',
      'Makan malam hidangan laut bakar tepi pantai saat matahari terbenam di Jimbaran',
      'Kunjungan terpandu ke Taman Budaya GWK, Pura Ulun Danu Bedugul & Tanah Lot',
      'Bus pariwisata ber-AC yang nyaman bersama pemandu berlisensi HPI'
    ],
    packageOptions: [
      {
        id: 'opt-group-twin',
        name: 'Kamar Berbagi Twin / Triple',
        description: 'Hotel Bintang 4 Area Kuta/Nusa Dua (2–3 peserta per kamar)',
        priceDelta: 0
      },
      {
        id: 'opt-group-single',
        name: 'Kamar Single (1 Orang / Kamar)',
        description: 'Kamar privat sendiri selama tur 3H2M berlangsung',
        priceDelta: 850000
      }
    ],
    departureDates: ['2026-11-22', '2026-11-29', '2026-12-06', '2026-12-20'],
    meetingPoint: 'Bandara Internasional Ngurah Rai (DPS)',
    departureLocation: 'Kuta / Nusa Dua, Bali',
    travelSchedule: 'Hari 1 Tiba sebelum 12:00 WITA • Hari 3 Kepulangan setelah 14:00 WITA',
    accommodationSummary: '2 Malam Resor Kuta / Nusa Dua Bintang 4',
    transportationSummary: 'Bus Pariwisata Eksekutif / Hiace Commuter + Pemandu Berlisensi',
    itinerary: [
      {
        day: 1,
        title: 'Kedatangan, Taman Budaya GWK & Makan Malam Jimbaran',
        description:
          'Penyambutan bandara, kunjungan patung Garuda Wisnu Kencana, Pantai Pandawa, dan makan malam seafood tepi pantai Jimbaran.',
        activities: [
          {
            time: '11:30 WITA',
            title: 'Penyambutan Rombongan di Bandara Ngurah Rai',
            detail: 'Berkumpul bersama pemandu HPI dan menaiki bus pariwisata eksekutif ber-AC.',
            type: 'transport'
          },
          {
            time: '14:00 WITA',
            title: 'Taman Budaya Garuda Wisnu Kencana (GWK)',
            detail: 'Tur terpandu mengelilingi kompleks patung monumental dan plaza budaya Bali Selatan.',
            type: 'sightseeing'
          },
          {
            time: '16:30 WITA',
            title: 'Pantai Tebing Kapur Pandawa',
            type: 'sightseeing'
          },
          {
            time: '18:30 WITA',
            title: 'Makan Malam Seafood Sunset Jimbaran & Check-in Hotel',
            detail: 'Menikmati sajian ikan dan hidangan laut bakar langsung di atas pasir pantai.',
            type: 'meal'
          }
        ],
        meals: ['Makan Malam'],
        accommodation: 'Hotel Bintang 4 Kuta / Nusa Dua'
      },
      {
        day: 2,
        title: 'Tanjung Benoa, Ulun Danu Bedugul & Tanah Lot',
        description:
          'Permainan banana boat pagi di Tanjung Benoa, kunjungan pura danau Ulun Danu Beratan, serta panorama senja di Tanah Lot.',
        activities: [
          {
            time: '09:00 WITA',
            title: 'Aktivitas Bahari Pantai Tanjung Benoa',
            detail: 'Termasuk 1x permainan Banana Boat gratis untuk seluruh peserta grup.',
            type: 'sightseeing'
          },
          {
            time: '13:00 WITA',
            title: 'Makan Siang Prasmanan & Pura Ulun Danu Beratan',
            detail: 'Menikmati udara sejuk pegunungan Bedugul dan pura terapung ikonik Danau Beratan.',
            type: 'meal'
          },
          {
            time: '17:00 WITA',
            title: 'Panorama Senja Pura Tanah Lot & Makan Malam',
            detail: 'Menyaksikan siluet pura di atas batu karang laut sebelum kembali ke hotel.',
            type: 'sightseeing'
          }
        ],
        meals: ['Sarapan', 'Makan Siang', 'Makan Malam'],
        accommodation: 'Hotel Bintang 4 Kuta / Nusa Dua'
      },
      {
        day: 3,
        title: 'Pusat Oleh-Oleh Krisna & Pengantaran Bandara',
        description: 'Check-out hotel, belanja kerajinan khas Bali, dan pengantaran menuju bandara.',
        activities: [
          {
            time: '08:30 WITA',
            title: 'Sarapan & Check-out Hotel',
            type: 'meal'
          },
          {
            time: '10:30 WITA',
            title: 'Belanja Oleh-Oleh Khas Bali di Krisna',
            detail: 'Waktu bebas memilih camilan pie susu, batik, dan kerajinan tangan Bali.',
            type: 'sightseeing'
          },
          {
            time: '13:00 WITA',
            title: 'Pengantaran Grup ke Bandara Ngurah Rai',
            type: 'transport'
          }
        ],
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Menginap 2 malam di hotel termasuk sarapan harian',
      'Bus grup ber-AC & pemandu wisata berlisensi HPI',
      'Gratis 1x aktivitas Banana Boat di Tanjung Benoa',
      'Seluruh tiket masuk wisata dan konsumsi sesuai jadwal'
    ],
    exclusions: [
      'Tiket pesawat & permainan olahraga air tambahan',
      'Tipping standar pemandu & pengemudi'
    ],
    importantNotes: ['Keberangkatan grup beroperasi sesuai tanggal terjadwal bersama peserta ASRIVA lainnya.'],
    cancellationPolicy: ['Perubahan jadwal diperbolehkan hingga 10 hari sebelum keberangkatan.'],
    reviews: [
      {
        id: 'r7',
        author: 'Ayu Lestari',
        date: 'Okt 2026',
        rating: 5,
        comment: 'Harga sangat terjangkau dan terorganisir dengan rapi! Cocok untuk liburan pertama kali ke Bali.'
      }
    ],
    availability: 18,
    minTravelers: 1,
    maxTravelers: 25,
    recommended: true,
    specialOffer: true
  }
];
