import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = process.env.AUTH_USERNAME
        const passwordHash = process.env.AUTH_PASSWORD_HASH

        if (!credentials?.username || !credentials?.password) return null
        if (credentials.username !== username) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          passwordHash!
        )
        if (!valid) return null

        return { id: "1", name: username as string }
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
})
