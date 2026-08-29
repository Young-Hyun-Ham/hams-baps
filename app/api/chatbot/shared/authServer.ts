import { getSsoUserFromRequest } from "@hams-fam/sso-client";

export async function requireUserId(req: Request): Promise<string> {
  const user = getSsoUserFromRequest(req);
  if (!user?.id) throw new Error("UNAUTHORIZED");
  return user.id;
}
