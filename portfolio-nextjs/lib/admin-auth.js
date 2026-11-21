import { cookies } from "next/headers";

const sessionCookie = "portfolio_admin_session";
const identityUrl = () => `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`;
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function firebaseAuthError(code) {
  if (code === "API_KEY_INVALID" || code === "INVALID_API_KEY") return "FIREBASE_API_KEY is invalid. Copy the Web API key from the same Firebase project as the admin account.";
  if (code === "OPERATION_NOT_ALLOWED") return "Enable Email/Password sign-in in Firebase Authentication.";
  if (code === "USER_DISABLED") return "This Firebase Authentication account is disabled.";
  if (["EMAIL_NOT_FOUND", "INVALID_PASSWORD", "INVALID_LOGIN_CREDENTIALS"].includes(code)) return "Email or password is incorrect.";
  return "Firebase Authentication could not complete sign-in. Check the Firebase project settings and try again.";
}

async function inspectIdToken(idToken) {
  if (!process.env.FIREBASE_API_KEY || !process.env.ADMIN_EMAIL) {
    throw new Error("Configure FIREBASE_API_KEY and ADMIN_EMAIL to enable admin sign-in.");
  }
  const response = await fetch(identityUrl(), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }), cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) return false;
  const user = body.users?.[0];
  return Boolean(user?.emailVerified && normalizeEmail(user.email) === normalizeEmail(process.env.ADMIN_EMAIL));
}

export async function signInAdmin(email, password) {
  if (!process.env.FIREBASE_API_KEY || !process.env.ADMIN_EMAIL) throw new Error("Admin sign-in is not configured yet.");
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  if (!isEmail(adminEmail)) throw new Error("ADMIN_EMAIL must be a complete email address in portfolio-nextjs/.env.local.");
  if (normalizeEmail(email) !== adminEmail) throw new Error("Enter the same email address configured as ADMIN_EMAIL.");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }), cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(firebaseAuthError(body.error?.message));
  const lookup = await fetch(identityUrl(), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: body.idToken }), cache: "no-store",
  });
  const lookupBody = await lookup.json();
  if (!lookup.ok) throw new Error(firebaseAuthError(lookupBody.error?.message));
  const user = lookupBody.users?.[0];
  if (!user?.emailVerified) throw new Error("Verify this account’s email in Firebase Authentication, then sign in again.");
  if (normalizeEmail(user.email) !== adminEmail) throw new Error("This account does not match ADMIN_EMAIL in portfolio-nextjs/.env.local.");
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, body.idToken, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: Number(body.expiresIn) || 3600,
  });
  return true;
}

export async function sendAdminVerification(email, password) {
  if (!process.env.FIREBASE_API_KEY || !process.env.ADMIN_EMAIL) throw new Error("Admin sign-in is not configured yet.");
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  if (!isEmail(adminEmail)) throw new Error("ADMIN_EMAIL must be a complete email address in portfolio-nextjs/.env.local.");
  if (normalizeEmail(email) !== adminEmail) throw new Error("Enter the same email address configured as ADMIN_EMAIL.");
  const signInResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password, returnSecureToken: true }), cache: "no-store",
  });
  const signInBody = await signInResponse.json();
  if (!signInResponse.ok || !signInBody.idToken) throw new Error(firebaseAuthError(signInBody.error?.message));
  const lookupResponse = await fetch(identityUrl(), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: signInBody.idToken }), cache: "no-store",
  });
  const lookupBody = await lookupResponse.json();
  if (!lookupResponse.ok) throw new Error(firebaseAuthError(lookupBody.error?.message));
  const user = lookupBody.users?.[0];
  if (normalizeEmail(user?.email) !== adminEmail) throw new Error("This account does not match ADMIN_EMAIL in portfolio-nextjs/.env.local.");
  if (user.emailVerified) return { alreadyVerified: true };

  const sendResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestType: "VERIFY_EMAIL", idToken: signInBody.idToken }), cache: "no-store",
  });
  const sendBody = await sendResponse.json();
  if (!sendResponse.ok) throw new Error(firebaseAuthError(sendBody.error?.message));
  return { alreadyVerified: false };
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get(sessionCookie)?.value;
  return idToken ? inspectIdToken(idToken) : false;
}

export async function requireAdmin(request) {
  const cookie = request.headers.get("cookie") || "";
  const idToken = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie}=`))?.slice(sessionCookie.length + 1);
  if (!idToken || !(await inspectIdToken(decodeURIComponent(idToken)))) return false;
  return true;
}

export async function signOutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie);
}
