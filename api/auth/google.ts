import type { Context } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session, Paths } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "../kimi/session";
import { findUserByGoogleId, findUserById, upsertUser } from "../queries/users";
import type { TokenResponse, GoogleUserProfile } from "./types";

async function exchangeAuthCode(
  code: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: env.googleRedirectUri,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }

  return resp.json();
}

async function getGoogleProfile(accessToken: string): Promise<GoogleUserProfile> {
  const resp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    throw new Error("Failed to fetch user profile from Google");
  }

  return resp.json();
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.unauthorized("Authentication required.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.unauthorized("Invalid or expired session.");
  }
  const user = await findUserById(claim.userId);
  if (!user) {
    throw Errors.unauthorized("User not found. Please re-login.");
  }
  return user;
}


export function createGoogleCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const error = c.req.query("error");
    const state = c.req.query("state"); // Contains the role

    if (error) {
      return c.redirect(Paths.login + "?error=" + error, 302);
    }

    if (!code) {
      return c.json({ error: "code is required" }, 400);
    }

    try {
      const tokenResp = await exchangeAuthCode(code);
      const googleProfile = await getGoogleProfile(tokenResp.access_token);
      
      const role = (state as any) || "candidate";

      const user = await upsertUser({
        googleId: googleProfile.id,
        name: googleProfile.name,
        email: googleProfile.email,
        avatar: googleProfile.picture,
        role: role,
        lastSignInAt: new Date(),
      });

      if (!user) throw new Error("Upsert failed");

      const token = await signSessionToken({
        userId: user.id,
        email: user.email!,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      // After login, redirect based on role
      if (user.role === "employer") return c.redirect("/employer", 302);
      if (user.role === "candidate") return c.redirect("/candidate", 302);
      return c.redirect("/", 302);
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      return c.redirect(Paths.login + "?error=callback_failed", 302);
    }
  };
}

