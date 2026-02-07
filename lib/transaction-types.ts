export const CATEGORY_VALUES = ["Food", "Transport", "Kids", "House", "Other"] as const;
export const USER_VALUES = ["Mom", "Helper"] as const;

export type TransactionCategory = (typeof CATEGORY_VALUES)[number];
export type TransactionUser = (typeof USER_VALUES)[number];

export interface TransactionInput {
  date: string;
  amount: number;
  category: TransactionCategory;
  merchant: string;
  user: TransactionUser;
  notes?: string;
}

export interface TransactionRecord extends TransactionInput {
  notes: string;
}
