export interface Entry {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  email: string;
  profile_picture: string;
}
