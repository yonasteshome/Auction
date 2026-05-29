export interface VendorProfileResponse {
  id: string;
  owner: number;
  owner_name: string;
  shop_name: string;
  city: string;
  address: string;
  contact_phone: string;
  is_verified: boolean;
  verification_status: 'unrequested' | 'requested' | 'pending' | 'verified' | 'rejected' | 'suspended';
  verification_rejection_reason?: string | null;
  business_license: string | null;
  business_license_url: string | null;
  tin_number: string;
  rating_avg: number;
  rating_count: number;
  latitude: number | null;
  longitude: number | null;
  business_hours?: { day: string; start: string; end: string }[] | null;
  image: string | null;
  image_url: string | null;
  theme_image: string | null;
  theme_image_url: string | null;
  joined_at: string;
}
