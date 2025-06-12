export interface ArtilleryContext {
  vars: Record<string, any>;
  funcs?: Record<string, Function>;
  [key: string]: any;
}

export type ArtilleryProcessorCallback = (error?: Error) => void;

export interface ArtilleryEvents {
  emit(event: string, data?: any): void;
}

export interface ArtilleryResponse {
  statusCode: number;
  body: string | object;
  headers: Record<string, string>;
}

export interface ArtilleryRequestParams {
  url: string;
  method: string;
  headers?: Record<string, string>;
  json?: any;
  body?: string;
}

// Custom types for your application
export interface User {
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  profile_picture: string;
  account_type: 'free' | 'premium';
  status?: 'active' | 'inactive';
  registration_date?: string;
  last_login?: string;
}

export interface Profile {
  profile_id?: string;
  user_id: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  preferred_language: string;
  date_of_birth: string;
  social_media_links: string[];
}

export interface Quote {
  quote_id?: string;
  user_id: string;
  quote_details: string;
  quote_type: 'free' | 'premium';
  estimated_cost: number;
  attachments: string[];
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  requested_date?: string;
  valid_until?: string;
}

export interface Ticket {
  ticket_id?: string;
  user_id: string;
  issue: string;
  priority_level: 'low' | 'medium' | 'high';
  description?: string;
  ticket_status?: 'open' | 'in-progress' | 'closed';
  created_date?: string;
  resolved_date?: string;
  assigned_to?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface RegistrationResponse {
  success: boolean;
  data: User;
}
