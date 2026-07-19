export type ToolId = 'chat' | 'coding' | 'website' | 'image' | 'copywriting' | 'seo';

export interface ToolMeta {
  title: string;
  subtitle: string;
  cardDescription: string;
}

export const TOOL_META: Record<ToolId, ToolMeta> = {
  chat: {
    title: 'AI Chat',
    subtitle: 'Konsultan · Estimator Harga · CS 24/7',
    cardDescription: 'Tanya jawab seputar layanan, estimasi harga, dan info umum HANNKEY16.',
  },
  coding: {
    title: 'Coding Assistant',
    subtitle: 'Tanya teknis seputar website & aplikasi',
    cardDescription: 'Diskusi teknis santai: hosting, stack, performa, dan perencanaan fitur.',
  },
  website: {
    title: 'Website Generator',
    subtitle: 'Lihat gambaran konsep website Anda',
    cardDescription: 'Deskripsikan bisnis Anda, dapatkan preview konsep website secara instan.',
  },
  image: {
    title: 'Image Studio',
    subtitle: 'Logo · Banner · Ilustrasi · Sosial · UI/UX',
    cardDescription: 'Buat gambar AI untuk logo, banner, ilustrasi, konten sosial, dan lainnya.',
  },
  copywriting: {
    title: 'Copywriting AI',
    subtitle: 'Caption · Deskripsi Produk · Artikel · Ad Copy',
    cardDescription: 'Hasilkan teks marketing yang siap pakai dalam hitungan detik.',
  },
  seo: {
    title: 'Website Audit & SEO',
    subtitle: 'Cek kesehatan SEO website Anda',
    cardDescription: 'Masukkan URL website Anda dan dapatkan audit SEO instan.',
  },
};

export interface ToolProps {
  onResult: (whatsappMessage: string | null) => void;
}
