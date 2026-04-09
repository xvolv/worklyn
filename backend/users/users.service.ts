import { userRepo } from "./users.repo";
import { sessionRepo } from "@/backend/auth/sessions";
import { hashPassword, verifyPassword } from "@/backend/auth/password";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "@/backend/auth/tokens";

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const userService = {
  async signup(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already in use, try login");
    }

    const hashedPassword = await hashPassword(password);

    const user = await userRepo.create({
      name,
      email,
      password: hashedPassword,
    });

    const payload: TokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await sessionRepo.create({
      sessionToken: refreshToken,
      userId: user.id,
      expires,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  },

  async signin(email: string, password: string): Promise<AuthResult> {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const payload: TokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await sessionRepo.create({
      sessionToken: refreshToken,
      userId: user.id,
      expires,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  },

  async getUserById(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },

  async signout(refreshToken: string) {
    await sessionRepo.delete(refreshToken);
  },
};
