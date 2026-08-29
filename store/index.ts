import { create } from "zustand";
import type { SsoSessionUser } from "@hams-fam/sso-client";

import {
  db,
  auth,
  doc,
  getDoc,
  collection,
  writeBatch,
  serverTimestamp,
  setDoc,
} from "@/lib/firebase";
import { locales } from "@/lib/locales";
import { createUISlice } from "@/store/slice/uiSlice";
import { NavItem, SidebarMenu } from "@/types/nav";
import { User } from "@/types/user";

const DEV_MOCK_LOGIN = process.env.NEXT_PUBLIC_DEV_MOCK_LOGIN === "true";

const USER_MOCK_DATA = {
  id: "3f206e64-1de1-4720-8013-6261f3aaeb46",
  sub: "3f206e64-1de1-4720-8013-6261f3aaeb46",
  uid: "3f206e64-1de1-4720-8013-6261f3aaeb46",
  email: "hyh8414@gmail.com",
  username: "함영현",
  name: "함영현",
  displayName: "함영현",
  nickname: "함영현",
  loginId: "ghyh84141",
  loginIdLower: "ghyh84141",
  emailLower: "hyh8414@gmail.com",
  roles: ["user", "admin"],
  provider: "google",
  providerSubject: null,
  phoneNumber: "01099360110",
  birthDate: null,
  gender: null,
  serviceMemberships: [],
  aiEnabled: true,
  aiChatType: "gpt",
  chatModel: "gpt-3.5-turbo",
  termsAcceptedAt: null,
  termsVersion: null,
  createdAt: "2026-04-09T06:56:22.125Z",
  updatedAt: "2026-04-24T05:00:11.863Z",
};

const BACKEND = process.env.NEXT_PUBLIC_BACKEND ?? "firebase";

const getInitialMessages = (lang: any = "ko") => [
  { id: "initial", sender: "bot", text: locales[lang].initialBotMessage },
];

export const useStore: any = create((set: any, get: any) => ({
  db,
  auth,
  user: null,
  authChecked: false,
  backend: BACKEND,

  headerMenus: [],
  setHeaderMMenus: (data: NavItem) => {
    set({ headerMenus: data });
  },
  sidebarMenus: [],
  setSidebarMenus: (data: SidebarMenu) => {
    set({ sidebarMenus: data });
  },

  adminSidebarCollapsed: false,
  setAdminSidebarCollapsed: (v: any) => set({ adminSidebarCollapsed: v }),
  toggleAdminSidebarCollapsed: () =>
    set({ adminSidebarCollapsed: !get().adminSidebarCollapsed }),

  setUser: (user: User) => {
    set({ user });
  },
  setRoles: (role: string) => {
    const user = get().user;
    if (!user) return;

    const currentRoles = Array.isArray(user.roles) ? user.roles : [];
    if (!currentRoles.includes(role)) {
      set({
        user: {
          ...user,
          roles: Array.from(new Set([...(user.roles || []), role])),
        },
      });
    }
  },
  removeRole: (role: string) => {
    const user = get().user;
    if (!user) return;

    set({
      user: {
        ...user,
        roles: (user.roles || []).filter((r: string) => r !== role),
      },
    });
  },

  ...createUISlice(set, get),

  setUserAndLoadData: async (user: any) => {
    set({ user });
    const includeAdminAccount = process.env.NEXT_PUBLIC_ADMIN_ACCOUNT ?? [""];

    if (BACKEND === "firebase" && user?.uid) {
      try {
        const usersRef = collection(get().db, "users");
        const userRef = doc(usersRef, user.uid);
        const snap = await getDoc(userRef);

        const baseData = {
          sub: user.uid,
          email: user.email ?? null,
          name: user.displayName ?? user.name ?? "",
          avatar_url: user.photoURL ?? null,
          provider: user.provider ?? "sso",
          roles: user.roles ?? ["user"],
        };

        if (!snap.exists()) {
          await setDoc(userRef, {
            ...baseData,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
        } else {
          await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        }
      } catch (err) {
        console.error("Firestore user upsert failed:", err);
      }
    }

    if (!Array.isArray(user.roles)) {
      get().setRoles("user");
      if (user.email && includeAdminAccount.includes(user.email)) {
        get().setRoles("admin");
      }
    } else if (user.email && includeAdminAccount.includes(user.email)) {
      get().setRoles("admin");
    }

    if (BACKEND === "postgres") {
      try {
        const updatesNeeded = 0;
        if (updatesNeeded <= 0) {
          console.log("No conversation migration needed.");
        }
      } catch (error) {
        console.error("Conversation migration failed:", error);
      }

      const theme = localStorage.getItem("theme") || "light";
      const fontSize = localStorage.getItem("fontSize") || "default";
      const language = localStorage.getItem("language") || "ko";

      set({
        theme,
        fontSize,
        language,
        messages: getInitialMessages(language),
      });
      return;
    }

    try {
      const batch = writeBatch(get().db);
      const updatesNeeded = 0;
      if (updatesNeeded > 0) {
        await batch.commit();
        console.log(`Migration complete: ${updatesNeeded} conversations updated.`);
      } else {
        console.log("No conversation migration needed.");
      }
    } catch (error) {
      console.error("Conversation migration failed:", error);
    }

    try {
      const userSettingsRef = doc(get().db, "settings", user.uid ?? user?.sub);
      const docSnap = await getDoc(userSettingsRef);
      const settings = docSnap.exists() ? docSnap.data() : {};

      const theme = settings.theme || localStorage.getItem("theme") || "light";
      const fontSize = settings.fontSize || localStorage.getItem("fontSize") || "default";
      const language = settings.language || localStorage.getItem("language") || "ko";

      set({
        theme,
        fontSize,
        language,
        messages: getInitialMessages(language),
      });
    } catch (error) {
      console.error("Error loading settings from Firestore:", error);
      const theme = localStorage.getItem("theme") || "light";
      const fontSize = localStorage.getItem("fontSize") || "default";
      const language = localStorage.getItem("language") || "ko";

      set({
        theme,
        fontSize,
        language,
        messages: getInitialMessages(language),
      });
    }
  },

  clearUserAndData: () => {
    let theme = "light";
    let fontSize = "default";
    let language = "ko";

    if (typeof window !== "undefined") {
      theme = localStorage.getItem("theme") || "light";
      fontSize = localStorage.getItem("fontSize") || "default";
      language = localStorage.getItem("language") || "ko";
    }

    set({
      user: null,
      authChecked: true,
      theme,
      fontSize,
      language,
      messages: getInitialMessages(language),
    });
  },

  initAuth: () => {
    fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("session_lookup_failed");
        const result = (await response.json()) as { user?: SsoSessionUser | null };
        if (!result.user) {
          get().clearUserAndData();
          return;
        }

        const ssoUser = result.user;
        const displayName =
          ssoUser.nickname || ssoUser.loginId || ssoUser.email.split("@")[0];
        const me: User = {
          id: ssoUser.id,
          sub: ssoUser.id,
          uid: ssoUser.id,
          email: ssoUser.email,
          username: displayName,
          name: displayName,
          displayName,
          nickname: displayName,
          loginId: ssoUser.loginId,
          loginIdLower: ssoUser.loginId.toLowerCase(),
          emailLower: ssoUser.email.toLowerCase(),
          roles: ["user"],
          provider: ssoUser.provider,
          providerSubject: ssoUser.providerSubject,
          phoneNumber: ssoUser.phoneNumber,
          birthDate: ssoUser.birthDate,
          gender: ssoUser.gender,
          serviceMemberships: ssoUser.serviceMemberships,
          aiEnabled: ssoUser.aiEnabled,
          aiChatType: ssoUser.aiChatType ?? "",
          chatModel: ssoUser.chatModel,
          termsAcceptedAt: null,
          termsVersion: ssoUser.termsVersion,
          createdAt: ssoUser.createdAt,
          updatedAt: ssoUser.updatedAt,
        };
        set({
          user: me,
          authChecked: true,
        });
        await get().setUserAndLoadData(me);
      })
      .catch(async () => {
        if (DEV_MOCK_LOGIN) {
          set({
            user: USER_MOCK_DATA,
            authChecked: true,
          });

          await get().setUserAndLoadData(USER_MOCK_DATA);
          return;
        }

        get().clearUserAndData();
      });
  },
}));
