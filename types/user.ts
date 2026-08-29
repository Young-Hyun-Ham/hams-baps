// types/user.ts
export type roleTypes = "guest" | "admin" | "user" | "";
export type aiChatTypes = "gpt" | "gemini" | "claude" | "";

export type ServiceMembership = {
  serviceSiteId: string;
  clientId: string;
  serviceName: string;
  plan: "basic" | "standard" | "premium";
  monthlyPrice: number;
  joinedAt: string;
};

export type User = {
  id: string;
  sub: string;
  uid?: string;
  email: string;
  username: string;
  name?: string | null;
  displayName?: string | null;
  nickname?: string | null;
  loginId?: string | null;
  loginIdLower?: string | null;
  emailLower?: string | null;
  roles?: roleTypes[];
  provider?: string;
  providerSubject?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  serviceMemberships?: ServiceMembership[];
  aiEnabled?: boolean;
  aiChatType?: aiChatTypes;
  apiKey?: string | null;
  chatModel?: string | null;
  termsAcceptedAt?: string | null;
  termsVersion?: string | null;
  passwordHash?: string | null;
  avatar_url?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastLoginAt?: string | null;
  isTestUser?: boolean;
  unuseFormElements?: string[];
  unuseNodes?: string[];
  nodeColors?: Record<string, string>;
}
