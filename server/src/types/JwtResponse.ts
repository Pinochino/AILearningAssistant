// src/types/JwtResponse.ts
export interface JwtResponse {
  // Các khóa khả dĩ trong token/session tuỳ backend
  userId?: string;
  id?: string;
  _id?: string;
  sub?: string;

  // Thông tin khác (tuỳ bạn có hay không)
  email?: string;
  role?: string | string[];
  iat?: number; // issued at
  exp?: number; // expiry
}
