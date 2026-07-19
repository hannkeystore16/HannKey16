import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'id' | 'en';

const STORAGE_KEY = 'hannkey16-lang';

export const translations = {
  en: {
    nav: {
      links: [
        { name: 'About', href: '#about' },
        { name: 'Services', href: '#services' },
        { name: 'Portfolio', href: '#portfolio' },
        { name: 'Process', href: '#process' },
        { name: 'Testimonials', href: '#testimonials' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Contact', href: '#contact' },
      ],
      talk: "Let's Talk",
      freeConsultation: 'Free Consultation',
      languageSwitcher: 'Language switcher',
      toggleMenu: 'Toggle menu',
    },
    hero: {
      badge: 'Elite Digital Agency',
      titleLine1: 'Build Better Websites,',
      titleLine2: 'Grow Bigger Business.',
      subtitle:
        'We help ambitious brands establish a dominant online presence with modern, fast, secure, and AI-powered digital experiences.',
      ctaPrimary: 'Get Started',
      ctaSecondary: 'Free Consultation',
      scroll: 'Scroll',
    },
    about: {
      kicker: 'About Hannkey16',
      titleLine1: 'We Craft Digital',
      titleLine2: 'Experiences That Convert.',
      body:
        "HANNKEY16 Digital Agency Indonesia is an international-class digital agency that makes brands feel fearless online. We don't just build websites; we engineer high-performance digital ecosystems designed for growth. Visit hannkey.com to see HANNKEY16 in action — every pixel is purposeful.",
      statNumber: '10+',
      statLabel: 'Years of Excellence',
      bullets: [
        'Uncompromising Quality & Innovation',
        'Lightning-Fast Performance & Secure Infrastructure',
        'AI-Powered Experiences & Future-Ready Tech',
        'Dedicated Long-Term Client Support',
      ],
      cta: 'View Our Work',
    },
    services: {
      kicker: 'Our Expertise',
      title: 'Comprehensive Digital Solutions',
      subtitle:
        'From visionary design to robust engineering, we deliver end-to-end digital services that elevate your brand and drive measurable results.',
      items: [
        { title: 'Professional Web Dev', desc: 'Custom tailored websites engineered for your specific business goals.' },
        { title: 'Business Landing Pages', desc: 'High-converting pages designed to capture leads and drive sales.' },
        { title: 'Company Profiles', desc: 'Establish digital authority with premium corporate identity sites.' },
        { title: 'E-Commerce', desc: 'Robust, secure online stores optimized for maximum conversion.' },
        { title: 'Custom Web Apps', desc: 'Complex workflows simplified into elegant, scalable web applications.' },
        { title: 'UI/UX Design', desc: 'User-centric interfaces that are intuitive, accessible, and stunning.' },
        { title: 'SEO Optimization', desc: 'Data-driven strategies to dominate search rankings and organic traffic.' },
        { title: 'AI Integration', desc: 'Automate processes and enhance user experiences with smart AI tools.' },
        { title: 'Speed Optimization', desc: 'Lightning-fast load times for better retention and search visibility.' },
        { title: 'Maintenance & Support', desc: 'Ongoing technical support to keep your site secure and up-to-date.' },
        { title: 'Mobile App Development', desc: 'Native and cross-platform mobile apps built for performance and scale.' },
      ],
    },
    whyChoose: {
      kicker: 'The HANNKEY16 Advantage',
      titleLine1: 'Why Forward-Thinking Brands',
      titleLine2: 'Choose Us.',
      body:
        "We don't compromise on quality. Our meticulous approach ensures every project not only looks stunning but performs flawlessly across every metric.",
      items: [
        'Premium & Modern Design',
        'Responsive on All Devices',
        'Fast Performance',
        'SEO Optimized',
        'Secure Website',
        'Affordable Pricing',
        'Professional Support',
        'Custom Development',
        'Scalable Solutions',
        'Latest Technology',
      ],
    },
    portfolio: {
      kicker: 'Selected Work',
      title: 'Crafted With Absolute Precision.',
      cta: 'Start Your Project',
      viewProject: 'View Project',
      items: [
        { title: 'Aura Fashion', category: 'E-Commerce', desc: 'High-end headless commerce experience.' },
        { title: 'Nexus Capital', category: 'Corporate Finance', desc: 'Trust-building institutional web presence.' },
        { title: 'DataSync Pro', category: 'SaaS Platform', desc: 'Intelligent dashboard for analytics.' },
        { title: 'Elevate Agency', category: 'Creative Portfolio', desc: 'Immersive storytelling landing page.' },
      ],
    },
    process: {
      kicker: 'Our Process',
      title: 'A Proven Formula for Success.',
      subtitle:
        'We follow a structured, transparent, and highly collaborative workflow to ensure flawless execution from concept to deployment.',
      steps: [
        { title: 'Consultation', desc: 'Understanding your goals, audience, and vision to set the perfect foundation.' },
        { title: 'Planning', desc: 'Mapping user journeys, site architecture, and technical requirements.' },
        { title: 'Design', desc: 'Crafting pixel-perfect, on-brand interfaces that captivate users.' },
        { title: 'Development', desc: 'Translating design into clean, performant, and secure code.' },
        { title: 'Testing', desc: 'Rigorous QA across devices, browsers, and load conditions.' },
        { title: 'Launch', desc: 'Smooth deployment to live servers with zero downtime.' },
        { title: 'Ongoing Support', desc: 'Continuous monitoring, updates, and optimization.' },
      ],
    },
    testimonials: {
      kicker: 'Client Success',
      title: "Don't Just Take Our Word For It.",
      items: [
        {
          name: 'Sarah Jenkins',
          role: 'CEO, TechFlow',
          text: 'HANNKEY16 delivered beyond our expectations. The new platform is blazing fast and has increased our conversion rate by 40%. Their attention to detail is unmatched.',
        },
        {
          name: 'Marcus Chen',
          role: 'Founder, Elevate Design',
          text: 'Working with this agency felt like an extension of our own team. They understood our brand immediately and translated it into a stunning digital experience.',
        },
        {
          name: 'Elena Rostova',
          role: 'Marketing Director, GlobalReach',
          text: 'The absolute best in the business. They handled our complex migration smoothly and the custom features they built are exactly what our users needed.',
        },
        {
          name: "David O'Connor",
          role: "Managing Partner, O'Connor Law",
          text: "Professional, responsive, and incredibly talented. Our new website has elevated our firm's credibility tremendously. Highly recommend HANNKEY16.",
        },
      ],
    },
    faq: {
      kicker: 'Questions & Answers',
      title: 'Common Inquiries.',
      items: [
        { q: 'How much does a website cost?', a: 'Pricing varies depending on complexity, features, and scale. We offer customized packages tailored to your specific needs, ensuring high ROI. Contact us for a precise quote.' },
        { q: 'How long does development take?', a: 'A standard landing page takes 1-2 weeks, while complex e-commerce or SaaS platforms can take 4-12 weeks. We establish clear timelines during the planning phase.' },
        { q: 'Do you offer revisions?', a: 'Yes. We believe in collaboration. Each phase of our process includes structured revision cycles to ensure the final product perfectly aligns with your vision.' },
        { q: 'Do you provide hosting and domains?', a: 'We can handle end-to-end setup, including premium hosting, domain registration, and SSL certificates, or we can deploy to your existing infrastructure.' },
        { q: 'What about ongoing maintenance?', a: 'We offer comprehensive monthly maintenance packages that include security updates, performance monitoring, content updates, and priority support.' },
        { q: 'Are your websites SEO optimized?', a: 'Absolutely. Technical SEO is built into our core process. We ensure proper tagging, structured data, fast load times, and mobile responsiveness.' },
        { q: 'Can you integrate AI into my site?', a: 'Yes, we specialize in AI integrations—from intelligent chatbots to automated content workflows and smart recommendation engines.' },
      ],
    },
    contact: {
      kicker: 'Get in Touch',
      titleLine1: 'Ready to Build',
      titleLine2: 'Something Extraordinary?',
      subtitle: "Let's discuss your project. Fill out the form or reach out directly. We aim to respond within 24 hours.",
      emailUs: 'Email Us',
      headquarters: 'Headquarters',
      address: 'Depok, West Java, Indonesia',
      whatsapp: 'Chat on WhatsApp',
      formTitle: 'Send a Message',
      name: 'Name',
      namePlaceholder: 'John Doe',
      email: 'Email',
      emailPlaceholder: 'john@example.com',
      subject: 'Subject',
      subjectPlaceholder: 'Project Inquiry',
      message: 'Message',
      messagePlaceholder: 'Tell us about your project...',
      send: 'Send Message',
      viewOnMap: 'View on OpenStreetMap',
      mapTitle: 'HANNKEY16 location on OpenStreetMap — Depok',
    },
    footer: {
      tagline: 'Build Better Websites, Grow Bigger Business.',
      body: 'We engineer digital excellence for ambitious brands globally.',
      quickLinks: 'Quick Links',
      legal: 'Legal',
      legalLinks: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
      quickLinksItems: ['About Us', 'Services', 'Portfolio', 'Our Process'],
      rights: 'All rights reserved.',
      engineered: 'Engineered with absolute precision.',
    },
    order: {
      kicker: 'Website Packages',
      title: 'Website Packages',
      subtitle: 'Get a free consultation and choose your website package right now!',
      dpNote: (percent: number) => `Pay ${percent}% down payment now to start — the rest is due on delivery.`,
      fullPaymentNote: 'Billed in full now.',
      startingFrom: 'Starting from',
      perMonth: '/ month',
      orderNow: 'Order Now',
      bookNow: 'Book Now',
      viewDetails: 'View Details',
      hideDetails: 'Hide Details',
      bestSeller: 'BEST SELLER!',
      consultFirst: 'Free Consultation First',
      whatsYouGet: 'Package Features',
      packages: [
        {
          id: 'silver',
          name: 'Silver',
          price: 'Rp 700.000',
          renewal: 'Renewal Rp 500.000/year',
          features: ['4 Pages/Menus', 'FREE .web.id Domain', 'Hosting 500 MB (~30 photos)', 'Listing on byb.co.id included'],
          detail: [
            'A website with up to 4 main pages/menus (e.g. Home, About, Services, and Contact) — a lean setup for getting your business online fast.',
            'A free .web.id domain for the first year, a good fit for local businesses and small enterprises.',
            '500 MB of hosting storage, enough for roughly 30 photos or working content on your site.',
            'Your business is automatically listed on the byb.co.id directory, making it easier for potential customers to find you.',
          ],
        },
        {
          id: 'gold',
          name: 'Gold',
          price: 'Rp 1.600.000',
          renewal: 'Renewal Rp 600.000/year',
          bestSeller: true,
          features: ['8 Pages/Menus', 'FREE .com Domain', 'Hosting 3 GB (~70 photos)', 'Listing on byb.co.id included'],
          detail: [
            'A website with up to 8 pages/menus — enough room for a fuller business profile.',
            'A free .com domain for the first year, the most common and professional extension.',
            '3 GB of hosting storage, enough for roughly 70 photos or working content.',
            'Your business is automatically listed on the byb.co.id directory.',
          ],
        },
        {
          id: 'diamond',
          name: 'Diamond',
          price: 'Rp 2.000.000',
          renewal: 'Renewal Rp 1.000.000/year',
          features: ['10 Pages/Menus', 'FREE .com/.co.id Domain', 'Hosting 3 GB (~90 photos)', 'Listing on byb.co.id included'],
          detail: [
            'A website with up to 10 pages/menus for more complex business needs.',
            'Free choice of a .com or .co.id domain for the first year.',
            '3 GB of hosting storage, enough for roughly 90 photos or working content.',
            'Your business is automatically listed on the byb.co.id directory.',
          ],
        },
        {
          id: 'platinum',
          name: 'Platinum',
          price: 'Rp 3.000.000',
          renewal: 'Renewal Rp 1.500.000/year',
          features: ['15-20 Pages/Menus', 'FREE .com/.co.id/.co/.id/.asia/.xyz Domain', 'Hosting 5 GB (~120 photos)', 'Listing on byb.co.id included'],
          detail: [
            'A website with 15-20 pages/menus for full-scale business needs.',
            'Free choice of one premium domain — .com, .co.id, .co, .id, .asia, or .xyz — for the first year.',
            '5 GB of hosting storage, enough for roughly 120 photos or working content.',
            'Your business is automatically listed on the byb.co.id directory.',
          ],
        },
      ],
      formTitle: 'Complete Your Order',
      selectedPackage: 'Selected package',
      changePackage: 'Change package',
      name: 'Full Name',
      namePlaceholder: 'John Doe',
      email: 'Email',
      emailPlaceholder: 'john@example.com',
      phone: 'WhatsApp Number',
      phonePlaceholder: '08123456789',
      notes: 'Project Notes (optional)',
      notesPlaceholder: 'Tell us anything relevant about your project...',
      submit: 'Continue to Payment',
      submitting: 'Processing...',
      amountDue: 'Amount due now',
      securedBy: 'Secured QRIS payment powered by DOKU',
      errorGeneric: 'Something went wrong. Please try again or contact us via WhatsApp.',
      successRedirecting: 'Redirecting you to secure payment...',
      statusPaidTitle: 'Payment received!',
      statusPaidBody: "Thank you — we've received your payment and will contact you shortly to kick off your project.",
      statusPendingTitle: 'Payment pending',
      statusPendingBody: "We haven't received your payment yet. If you already paid, it may take a moment to confirm.",
      statusExpiredTitle: 'Payment expired',
      statusExpiredBody: 'Your payment session expired. Please place a new order to try again.',
      statusFailedTitle: 'Payment failed',
      statusFailedBody: 'Your payment could not be processed. Please try again or contact us via WhatsApp.',
      backToPackages: 'Back to packages',
    },
  },
  id: {
    nav: {
      links: [
        { name: 'Tentang', href: '#about' },
        { name: 'Layanan', href: '#services' },
        { name: 'Portofolio', href: '#portfolio' },
        { name: 'Proses', href: '#process' },
        { name: 'Testimoni', href: '#testimonials' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Kontak', href: '#contact' },
      ],
      talk: 'Hubungi Kami',
      freeConsultation: 'Konsultasi Gratis',
      languageSwitcher: 'Pengalih bahasa',
      toggleMenu: 'Buka menu',
    },
    hero: {
      badge: 'Agensi Digital Elite',
      titleLine1: 'Bangun Website Lebih Baik,',
      titleLine2: 'Tumbuhkan Bisnis Lebih Besar.',
      subtitle:
        'Kami membantu brand ambisius membangun kehadiran online yang dominan dengan pengalaman digital yang modern, cepat, aman, dan didukung AI.',
      ctaPrimary: 'Mulai Sekarang',
      ctaSecondary: 'Konsultasi Gratis',
      scroll: 'Gulir',
    },
    about: {
      kicker: 'Tentang Hannkey16',
      titleLine1: 'Kami Merancang Pengalaman Digital',
      titleLine2: 'yang Berdampak Nyata.',
      body:
        'HANNKEY16 Digital Agency Indonesia adalah agensi digital berkelas internasional yang membuat brand tampil percaya diri secara online. Kami tidak hanya membangun website; kami merancang ekosistem digital berperforma tinggi yang dirancang untuk pertumbuhan. Kunjungi hannkey.com untuk melihat HANNKEY16 beraksi — setiap detail memiliki tujuan.',
      statNumber: '10+',
      statLabel: 'Tahun Pengalaman',
      bullets: [
        'Kualitas & Inovasi Tanpa Kompromi',
        'Performa Super Cepat & Infrastruktur Aman',
        'Pengalaman Bertenaga AI & Teknologi Masa Depan',
        'Dukungan Klien Jangka Panjang',
      ],
      cta: 'Lihat Karya Kami',
    },
    services: {
      kicker: 'Keahlian Kami',
      title: 'Solusi Digital Menyeluruh',
      subtitle:
        'Dari desain visioner hingga pengembangan yang solid, kami menghadirkan layanan digital end-to-end yang mengangkat brand Anda dan memberikan hasil yang terukur.',
      items: [
        { title: 'Pengembangan Website Profesional', desc: 'Website custom yang dirancang khusus sesuai tujuan bisnis Anda.' },
        { title: 'Landing Page Bisnis', desc: 'Halaman dengan konversi tinggi untuk menangkap leads dan mendorong penjualan.' },
        { title: 'Company Profile', desc: 'Bangun otoritas digital dengan situs identitas korporat premium.' },
        { title: 'E-Commerce', desc: 'Toko online yang tangguh dan aman, dioptimalkan untuk konversi maksimal.' },
        { title: 'Aplikasi Web Custom', desc: 'Proses bisnis yang kompleks disederhanakan menjadi aplikasi web yang elegan dan scalable.' },
        { title: 'UI/UX Design', desc: 'Antarmuka yang intuitif, mudah diakses, dan memukau, berfokus pada pengguna.' },
        { title: 'Optimasi SEO', desc: 'Strategi berbasis data untuk mendominasi peringkat pencarian dan trafik organik.' },
        { title: 'Integrasi AI', desc: 'Otomatisasi proses dan tingkatkan pengalaman pengguna dengan tools AI pintar.' },
        { title: 'Optimasi Kecepatan', desc: 'Waktu muat super cepat untuk retensi dan visibilitas pencarian yang lebih baik.' },
        { title: 'Maintenance & Support', desc: 'Dukungan teknis berkelanjutan agar website Anda tetap aman dan up-to-date.' },
        { title: 'Pengembangan Aplikasi Mobile', desc: 'Aplikasi mobile native dan cross-platform yang dibangun untuk performa dan skala.' },
      ],
    },
    whyChoose: {
      kicker: 'Keunggulan HANNKEY16',
      titleLine1: 'Mengapa Brand yang Visioner',
      titleLine2: 'Memilih Kami.',
      body:
        'Kami tidak berkompromi soal kualitas. Pendekatan kami yang teliti memastikan setiap proyek tidak hanya tampil memukau, tetapi juga berperforma sempurna di setiap aspek.',
      items: [
        'Desain Premium & Modern',
        'Responsif di Semua Perangkat',
        'Performa Cepat',
        'Teroptimasi untuk SEO',
        'Website Aman',
        'Harga Terjangkau',
        'Dukungan Profesional',
        'Pengembangan Custom',
        'Solusi yang Scalable',
        'Teknologi Terbaru',
      ],
    },
    portfolio: {
      kicker: 'Karya Pilihan',
      title: 'Dirancang Dengan Presisi Tinggi.',
      cta: 'Mulai Proyek Anda',
      viewProject: 'Lihat Proyek',
      items: [
        { title: 'Aura Fashion', category: 'E-Commerce', desc: 'Pengalaman headless commerce kelas premium.' },
        { title: 'Nexus Capital', category: 'Keuangan Korporat', desc: 'Kehadiran web institusional yang membangun kepercayaan.' },
        { title: 'DataSync Pro', category: 'Platform SaaS', desc: 'Dashboard analitik yang cerdas.' },
        { title: 'Elevate Agency', category: 'Portofolio Kreatif', desc: 'Landing page storytelling yang imersif.' },
      ],
    },
    process: {
      kicker: 'Proses Kami',
      title: 'Formula Terbukti untuk Kesuksesan.',
      subtitle:
        'Kami menjalankan proses kerja yang terstruktur, transparan, dan sangat kolaboratif untuk memastikan eksekusi yang sempurna dari konsep hingga peluncuran.',
      steps: [
        { title: 'Konsultasi', desc: 'Memahami tujuan, target audiens, dan visi Anda untuk membangun fondasi yang tepat.' },
        { title: 'Perencanaan', desc: 'Memetakan user journey, struktur situs, dan kebutuhan teknis.' },
        { title: 'Desain', desc: 'Merancang antarmuka yang presisi dan sesuai brand untuk memikat pengguna.' },
        { title: 'Pengembangan', desc: 'Menerjemahkan desain menjadi kode yang bersih, cepat, dan aman.' },
        { title: 'Pengujian', desc: 'QA menyeluruh di berbagai perangkat, browser, dan kondisi beban.' },
        { title: 'Peluncuran', desc: 'Deployment yang mulus ke server live tanpa downtime.' },
        { title: 'Dukungan Berkelanjutan', desc: 'Pemantauan, pembaruan, dan optimasi yang berkelanjutan.' },
      ],
    },
    testimonials: {
      kicker: 'Kesuksesan Klien',
      title: 'Jangan Hanya Percaya Kata Kami.',
      items: [
        {
          name: 'Sarah Jenkins',
          role: 'CEO, TechFlow',
          text: 'HANNKEY16 memberikan hasil di luar ekspektasi kami. Platform baru ini sangat cepat dan meningkatkan tingkat konversi kami hingga 40%. Perhatian mereka terhadap detail luar biasa.',
        },
        {
          name: 'Marcus Chen',
          role: 'Founder, Elevate Design',
          text: 'Bekerja dengan agensi ini rasanya seperti perpanjangan dari tim kami sendiri. Mereka langsung memahami brand kami dan menerjemahkannya menjadi pengalaman digital yang memukau.',
        },
        {
          name: 'Elena Rostova',
          role: 'Marketing Director, GlobalReach',
          text: 'Yang terbaik di bidangnya. Mereka menangani migrasi kompleks kami dengan lancar dan fitur custom yang mereka buat sangat sesuai kebutuhan pengguna kami.',
        },
        {
          name: "David O'Connor",
          role: "Managing Partner, O'Connor Law",
          text: 'Profesional, responsif, dan sangat berbakat. Website baru kami sangat meningkatkan kredibilitas firma kami. Sangat merekomendasikan HANNKEY16.',
        },
      ],
    },
    faq: {
      kicker: 'Tanya & Jawab',
      title: 'Pertanyaan Umum.',
      items: [
        { q: 'Berapa biaya membuat website?', a: 'Harga bervariasi tergantung kompleksitas, fitur, dan skala proyek. Kami menawarkan paket yang disesuaikan dengan kebutuhan spesifik Anda untuk memastikan ROI yang tinggi. Hubungi kami untuk penawaran yang akurat.' },
        { q: 'Berapa lama waktu pengembangan?', a: 'Landing page standar membutuhkan 1-2 minggu, sementara platform e-commerce atau SaaS yang kompleks bisa memakan waktu 4-12 minggu. Kami menetapkan timeline yang jelas pada fase perencanaan.' },
        { q: 'Apakah ada revisi?', a: 'Ya. Kami percaya pada kolaborasi. Setiap fase proses kami mencakup siklus revisi terstruktur untuk memastikan hasil akhir sesuai dengan visi Anda.' },
        { q: 'Apakah menyediakan hosting dan domain?', a: 'Kami dapat menangani setup end-to-end, termasuk hosting premium, registrasi domain, dan sertifikat SSL, atau kami bisa deploy ke infrastruktur Anda yang sudah ada.' },
        { q: 'Bagaimana dengan maintenance berkelanjutan?', a: 'Kami menawarkan paket maintenance bulanan yang komprehensif, termasuk update keamanan, pemantauan performa, update konten, dan dukungan prioritas.' },
        { q: 'Apakah website Anda teroptimasi untuk SEO?', a: 'Tentu saja. SEO teknis sudah menjadi bagian dari proses inti kami. Kami memastikan tagging yang tepat, structured data, waktu muat cepat, dan responsif di perangkat mobile.' },
        { q: 'Bisakah AI diintegrasikan ke website saya?', a: 'Ya, kami berspesialisasi dalam integrasi AI—dari chatbot pintar hingga workflow konten otomatis dan mesin rekomendasi yang cerdas.' },
      ],
    },
    contact: {
      kicker: 'Hubungi Kami',
      titleLine1: 'Siap Membangun',
      titleLine2: 'Sesuatu yang Luar Biasa?',
      subtitle: 'Mari diskusikan proyek Anda. Isi formulir atau hubungi kami langsung. Kami berusaha merespons dalam 24 jam.',
      emailUs: 'Email Kami',
      headquarters: 'Kantor Pusat',
      address: 'Depok, Jawa Barat, Indonesia',
      whatsapp: 'Chat di WhatsApp',
      formTitle: 'Kirim Pesan',
      name: 'Nama',
      namePlaceholder: 'Budi Santoso',
      email: 'Email',
      emailPlaceholder: 'budi@contoh.com',
      subject: 'Subjek',
      subjectPlaceholder: 'Pertanyaan Proyek',
      message: 'Pesan',
      messagePlaceholder: 'Ceritakan tentang proyek Anda...',
      send: 'Kirim Pesan',
      viewOnMap: 'Lihat di OpenStreetMap',
      mapTitle: 'Lokasi HANNKEY16 di OpenStreetMap — Depok',
    },
    footer: {
      tagline: 'Bangun Website Lebih Baik, Tumbuhkan Bisnis Lebih Besar.',
      body: 'Kami merancang keunggulan digital untuk brand ambisius di seluruh dunia.',
      quickLinks: 'Tautan Cepat',
      legal: 'Legal',
      legalLinks: ['Kebijakan Privasi', 'Syarat & Ketentuan', 'Kebijakan Cookie'],
      quickLinksItems: ['Tentang Kami', 'Layanan', 'Portofolio', 'Proses Kami'],
      rights: 'Seluruh hak dilindungi.',
      engineered: 'Dirancang dengan presisi mutlak.',
    },
    order: {
      kicker: 'Paket Website',
      title: 'Paket Website',
      subtitle: 'Konsultasikan dan pilih paket website Anda sekarang juga!',
      dpNote: (percent: number) => `Bayar DP ${percent}% sekarang untuk memulai — sisanya dibayar saat proyek selesai.`,
      fullPaymentNote: 'Dibayar penuh sekarang.',
      startingFrom: 'Mulai dari',
      perMonth: '/ bulan',
      orderNow: 'Pesan Sekarang',
      bookNow: 'Book Now',
      viewDetails: 'Lihat Detail',
      hideDetails: 'Sembunyikan Detail',
      bestSeller: 'BEST SELLER!',
      consultFirst: 'Konsultasi Gratis Dulu',
      whatsYouGet: 'Fitur Paket',
      packages: [
        {
          id: 'silver',
          name: 'Silver',
          price: 'Rp 700.000',
          renewal: 'Perpanjangan Rp 500.000/tahun',
          features: ['4 Menu', 'FREE Domain .web.id', 'Hosting 500 MB (±30 foto)', 'Include Listing di byb.co.id'],
          detail: [
            'Website dengan hingga 4 halaman/menu utama (misalnya Beranda, Tentang, Layanan, dan Kontak) — cocok untuk mulai online dengan cepat.',
            'Domain .web.id gratis untuk tahun pertama, cocok untuk bisnis lokal dan UMKM.',
            'Kapasitas hosting 500 MB, cukup untuk sekitar 30 foto atau konten kerja di website Anda.',
            'Bisnis Anda otomatis terdaftar di direktori byb.co.id agar lebih mudah ditemukan calon pelanggan.',
          ],
        },
        {
          id: 'gold',
          name: 'Gold',
          price: 'Rp 1.600.000',
          renewal: 'Perpanjangan Rp 600.000/tahun',
          bestSeller: true,
          features: ['8 Menu', 'FREE Domain .com', 'Hosting 3 GB (±70 foto)', 'Include Listing di byb.co.id'],
          detail: [
            'Website dengan hingga 8 halaman/menu, cukup untuk profil bisnis yang lebih lengkap.',
            'Domain .com gratis untuk tahun pertama — ekstensi paling umum dan profesional.',
            'Kapasitas hosting 3 GB, cukup untuk sekitar 70 foto atau konten kerja.',
            'Bisnis Anda otomatis terdaftar di direktori byb.co.id.',
          ],
        },
        {
          id: 'diamond',
          name: 'Diamond',
          price: 'Rp 2.000.000',
          renewal: 'Perpanjangan Rp 1.000.000/tahun',
          features: ['10 Menu', 'FREE Domain .com/.co.id', 'Hosting 3 GB (±90 foto)', 'Include Listing di byb.co.id'],
          detail: [
            'Website dengan hingga 10 halaman/menu untuk kebutuhan bisnis yang lebih kompleks.',
            'Bebas pilih domain .com atau .co.id gratis untuk tahun pertama.',
            'Kapasitas hosting 3 GB, cukup untuk sekitar 90 foto atau konten kerja.',
            'Bisnis Anda otomatis terdaftar di direktori byb.co.id.',
          ],
        },
        {
          id: 'platinum',
          name: 'Platinum',
          price: 'Rp 3.000.000',
          renewal: 'Perpanjangan Rp 1.500.000/tahun',
          features: ['15-20 Menu', 'FREE Domain .com/.co.id/.co/.id/.asia/.xyz', 'Hosting 5 GB (±120 foto)', 'Include Listing di byb.co.id'],
          detail: [
            'Website dengan 15-20 halaman/menu untuk kebutuhan perusahaan skala penuh.',
            'Bebas pilih salah satu domain premium: .com, .co.id, .co, .id, .asia, atau .xyz — gratis di tahun pertama.',
            'Kapasitas hosting 5 GB, cukup untuk sekitar 120 foto atau konten kerja.',
            'Bisnis Anda otomatis terdaftar di direktori byb.co.id.',
          ],
        },
      ],
      formTitle: 'Selesaikan Pesanan Anda',
      selectedPackage: 'Paket terpilih',
      changePackage: 'Ganti paket',
      name: 'Nama Lengkap',
      namePlaceholder: 'Budi Santoso',
      email: 'Email',
      emailPlaceholder: 'budi@contoh.com',
      phone: 'Nomor WhatsApp',
      phonePlaceholder: '08123456789',
      notes: 'Catatan Proyek (opsional)',
      notesPlaceholder: 'Ceritakan hal penting tentang proyek Anda...',
      submit: 'Lanjut ke Pembayaran',
      submitting: 'Memproses...',
      amountDue: 'Jumlah yang harus dibayar sekarang',
      securedBy: 'Pembayaran QRIS aman melalui DOKU',
      errorGeneric: 'Terjadi kesalahan. Silakan coba lagi atau hubungi kami via WhatsApp.',
      successRedirecting: 'Mengarahkan Anda ke halaman pembayaran aman...',
      statusPaidTitle: 'Pembayaran diterima!',
      statusPaidBody: 'Terima kasih — pembayaran Anda telah kami terima dan tim kami akan segera menghubungi Anda untuk memulai proyek.',
      statusPendingTitle: 'Pembayaran tertunda',
      statusPendingBody: 'Kami belum menerima pembayaran Anda. Jika sudah membayar, mohon tunggu sebentar untuk konfirmasi.',
      statusExpiredTitle: 'Pembayaran kedaluwarsa',
      statusExpiredBody: 'Sesi pembayaran Anda telah berakhir. Silakan buat pesanan baru untuk mencoba lagi.',
      statusFailedTitle: 'Pembayaran gagal',
      statusFailedBody: 'Pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi kami via WhatsApp.',
      backToPackages: 'Kembali ke paket',
    },
  },
};

type Translation = typeof translations['en'];

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'id' || stored === 'en' ? stored : 'en';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
