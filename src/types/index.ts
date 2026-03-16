export interface Listing {
  id: string;
  title: string;
  location: string;
  street_address: string;
  property_type: string;
  share_size: string;
  price: number;
  full_property_value?: number | null;
  occupancy?: string | null;
  description?: string | null;
  images: string[];
  contact_email: string;
  contact_phone?: string | null;
  lat?: number | null;
  lng?: number | null;
  is_top: boolean;
  is_highlighted: boolean;
  created_at: string;
}
