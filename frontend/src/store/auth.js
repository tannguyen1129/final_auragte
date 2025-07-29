// store/auth.js
import { create } from 'zustand';
import client from '@/lib/apollo-client';
import { gql } from '@apollo/client';

const ME_QUERY = gql`
  query {
    me {
      id
      fullName
      email
      role
    }
  }
`;

export const useAuth = create((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user: null,

  login: async (token) => {
    localStorage.setItem("token", token);
    set({ token });

    try {
      const { data } = await client.query({ query: ME_QUERY });
      set({ user: data.me });
    } catch (e) {
      console.error("❌ Error fetching me:", e);
    }
  },

  loadUser: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      const { data } = await client.query({ query: ME_QUERY });
      set({ token, user: data.me });
    } catch (e) {
      console.error("❌ Failed to load user:", e);
      set({ token: null, user: null });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
