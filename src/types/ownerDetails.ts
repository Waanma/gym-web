// types/ownerDetails.ts
export type OwnerDetails = {
  full_name: string;
  phone_number: string;
  address: string;
  subscription_plan: 'Basic' | 'Advanced' | 'Premium';
  subscription_start_date: string; 
  preferred_payment_method: string;
};
