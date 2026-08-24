export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface SiteSettings {
  site_name?: string;
  full_name?: string;
  tagline?: string;
  description?: string;
  logo_text?: string;
  logo_image?: string;
  phone?: string;
  email?: string;
  admissions_email?: string;
  address?: string;
  academic_calendar_url?: string;
  repository_url?: string;
  inscriptions_open?: string;
  inscriptions_badge?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  stat_active_students?: string;
  stat_masters_doctors?: string;
  stat_published_papers?: string;
  stat_partner_universities?: string;
  [key: string]: string | undefined;
}

export interface HeroSlide {
  id: number;
  badge?: string;
  title: string;
  subtitle?: string;
  image_url: string;
  primary_btn_text?: string;
  primary_btn_link?: string;
  secondary_btn_text?: string;
  secondary_btn_link?: string;
  order_index?: number;
  is_active?: number;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
  degree?: string;
  duration?: string;
  modality?: string;
  description?: string;
  syllabus?: string;
  requirements?: string;
  vacancies?: number;
  image_url?: string;
  featured?: number;
  is_active?: number;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  author?: string;
  published_at?: string;
  views?: number;
  is_published?: number;
}

export interface EventItem {
  id: number;
  title: string;
  event_date: string;
  event_time?: string;
  location?: string;
  description?: string;
  category?: string;
  registration_url?: string;
  image_url?: string;
  is_active?: number;
}

export interface PublicationItem {
  id: number;
  title: string;
  authors: string;
  year?: number;
  publication_type?: string;
  abstract?: string;
  download_url?: string;
  cover_url?: string;
  isbn?: string;
}

export interface FeatureItem {
  id: number;
  step_number: string;
  title: string;
  description: string;
  order_index?: number;
}

export interface ApplicationItem {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  identity_card?: string;
  course_id?: number;
  course_title: string;
  academic_degree?: string;
  graduation_institution?: string;
  notes?: string;
  status: 'Pendente' | 'Aprovado' | 'Em Análise' | 'Rejeitado';
  created_at: string;
}

export interface InstitutionalPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  updated_at?: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  url: string;
  mimetype?: string;
  size?: number;
  created_at: string;
}

export interface FullContentPayload {
  settings: SiteSettings;
  heroSlides: HeroSlide[];
  courses: Course[];
  news: NewsItem[];
  events: EventItem[];
  publications: PublicationItem[];
  features: FeatureItem[];
  pages: InstitutionalPage[];
}

export type InitialDataResponse = FullContentPayload;
