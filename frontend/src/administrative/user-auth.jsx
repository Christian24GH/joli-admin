import React, { useState, useEffect, useRef, createContext, useContext } from "react";

// -------------------- Mocked API (replace with real backend) --------------------
const mockApi = {
  login: async ({ identifier, password }) => {
    await sleep(600);
    if (identifier === "locked@example.com") return { success: false, reason: "locked" };
    if (password === "password123") {
      return { success: true, needsMfa: true, user: { id: 1, name: "Demo User", email: "demo@example.com" } };
    }
    return { success: false, reason: "invalid_credentials" };
  },
  verifyMfa: async ({ userId, otp }) => {
    await sleep(400);
    if (otp === "123456") return { success: true, token: "FAKE_JWT_TOKEN" };
    return { success: false };
  },
  requestPasswordReset: async ({ identifier }) => {
    await sleep(400);
    return { success: true };
  },
  changePassword: async ({ userId, oldPassword, newPassword }) => {
    await sleep(400);
    if (oldPassword === "password123") return { success: true };
    return { success: false, reason: "wrong_old_password" };
  },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const storage = {
  get: (k) => JSON.parse(localStorage.getItem(k)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k) => localStorage.removeItem(k),
};

function detectDeviceInfo() {
  const ua = navigator.userAgent || "unknown";
  const platform = navigator.platform || "unknown";
  return { ua, platform };
}

async function getPublicIp() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (!res.ok) return null;
    const json = await res.json();
    return json.ip;
  } catch (e) {
    return null;
  }
}

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get("user") || null);
  const [token, setToken] = useState(() => storage.get("token") || null);

  useEffect(() => {
    storage.set("user", user);
  }, [user]);
  useEffect(() => {
    storage.set("token", token);
  }, [token]);

  const loginWithToken = (t, u) => {
    setToken(t);
    setUser(u);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    storage.remove("session_expiry");
  };

  return (
    <AuthContext.Provider value={{ user, token, loginWithToken, logout }}>{children}</AuthContext.Provider>
  );
}

function useSessionTimeout({ inactivityMinutes = 15, absoluteMinutes = 60, onTimeout }) {
  const timerRef = useRef();
  const absoluteRef = useRef();

  useEffect(() => {
    function resetInactivity() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onTimeout("inactive"), inactivityMinutes * 60 * 1000);
      storage.set("session_expiry", { until: Date.now() + inactivityMinutes * 60 * 1000 });
    }
    absoluteRef.current = setTimeout(() => onTimeout("absolute"), absoluteMinutes * 60 * 1000);
    const events = ["mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetInactivity));
    resetInactivity();
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(absoluteRef.current);
      events.forEach((e) => window.removeEventListener(e, resetInactivity));
    };
  }, [inactivityMinutes, absoluteMinutes, onTimeout]);
}

function useLockout({ maxAttempts = 5, lockoutMinutes = 15 }) {
  const key = "auth_lockout";
  const [state, setState] = useState(() => storage.get(key) || { attempts: 0, lockedUntil: null });
  useEffect(() => {
    storage.set(key, state);
  }, [state]);
  const recordFailure = () => {
    const now = Date.now();
    let { attempts } = state;
    attempts += 1;
    if (attempts >= maxAttempts) {
      const lockedUntil = now + lockoutMinutes * 60 * 1000;
      setState({ attempts, lockedUntil });
      return { locked: true, lockedUntil };
    }
    setState({ attempts, lockedUntil: null });
    return { locked: false, attempts };
  };
  const reset = () => setState({ attempts: 0, lockedUntil: null });
  const isLocked = () => {
    if (!state.lockedUntil) return false;
    if (Date.now() > state.lockedUntil) {
      reset();
      return false;
    }
    return true;
  };
  return { recordFailure, reset, isLocked, state };
}

function LoginForm({ onLoginSuccess, lockout }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (lockout.isLocked()) return setError("Account is locked. Try later.");
    setLoading(true);
    const res = await mockApi.login({ identifier, password });
    setLoading(false);
    if (res.success) {
      if (res.needsMfa) {
        onLoginSuccess({ preMfaUser: res.user });
      } else {
        onLoginSuccess({ token: res.token, user: res.user });
      }
    } else {
      if (res.reason === "locked") {
        setError("Account locked by server. Contact support.");
        return;
      }
      const lockResult = lockout.recordFailure();
      if (lockResult.locked) {
        setError(`Too many failed attempts. Locked until ${new Date(lockResult.lockedUntil).toLocaleString()}`);
      } else {
        setError("Invalid credentials. Attempts: " + (lockResult.attempts || 1));
      }
    }
  };
  return (
    <form onSubmit={handleSubmit} className="p-4 rounded shadow bg-white max-w-md w-full">
      <h2 className="text-xl font-semibold mb-3">Sign in</h2>
      <label className="block mb-2 text-sm">Username / Email / Mobile</label>
      <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com or +63917..." className="mb-3 w-full p-2 border rounded" />
      <label className="block mb-2 text-sm">Password</label>
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••" className="mb-3 w-full p-2 border rounded" />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? "Signing in..." : "Sign in"}</button>
        <button type="button" onClick={() => alert("Open password recovery flow") } className="px-4 py-2 rounded border">Forgot?</button>
      </div>
    </form>
  );
}

function MfaForm({ preMfaUser, onVerified }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleVerify = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    const res = await mockApi.verifyMfa({ userId: preMfaUser.id, otp });
    setLoading(false);
    if (res.success) {
      onVerified({ token: res.token || "FAKE_JWT_TOKEN", user: preMfaUser });
    } else {
      setError("Invalid OTP. Try again.");
    }
  };
  return (
    <div className="p-4 rounded shadow bg-white max-w-md w-full">
      <h3 className="text-lg font-medium mb-2">Multi-factor authentication</h3>
      <p className="text-sm mb-3">We sent a one-time code to your registered device/email.</p>
      <form onSubmit={handleVerify}>
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" className="mb-3 p-2 w-full border rounded" />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-green-600 text-white" type="submit">{loading ? "Verifying..." : "Verify"}</button>
          <button type="button" onClick={() => alert("Resend code (mock)") } className="px-4 py-2 rounded border">Resend</button>
        </div>
      </form>
    </div>
  );
}

function PasswordReset() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await mockApi.requestPasswordReset({ identifier });
    setLoading(false);
    if (res.success) setMessage("Password reset instructions sent if the account exists.");
    else setMessage("Unexpected error. Try again.");
  };
  return (
    <form onSubmit={submit} className="p-4 rounded shadow bg-white max-w-md w-full">
      <h3 className="text-lg font-medium mb-2">Password recovery</h3>
      <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="username or email or mobile" className="mb-3 p-2 w-full border rounded" />
      <button disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white">{loading ? "Sending..." : "Send reset"}</button>
      {message && <div className="mt-3 text-sm">{message}</div>}
    </form>
  );
}

function AccountPanel({ onLogout }) {
  const { user } = useAuth();
  const [deviceInfo, setDeviceInfo] = useState({});
  const [ip, setIp] = useState(null);
  useEffect(() => {
    setDeviceInfo(detectDeviceInfo());
    getPublicIp().then((i) => setIp(i));
  }, []);
  return (
    <div className="p-4 rounded shadow bg-white max-w-lg w-full">
      <h3 className="text-lg font-medium">Welcome, {user?.name || "User"}</h3>
      <div className="mt-3">
        <div className="text-sm">Email: {user?.email}</div>
        <div className="text-sm">Device: {deviceInfo.platform} / {deviceInfo.ua?.slice(0, 80)}...</div>
        <div className="text-sm">Public IP: {ip || "(unable to fetch)"}</div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onLogout} className="px-4 py-2 rounded border">Logout</button>
        <button onClick={() => alert('Open change password modal (not implemented)')} className="px-4 py-2 rounded bg-yellow-400">Change password</button>
      </div>
    </div>
  );
}

export default function UserAuthApp() {
  const [stage, setStage] = useState("login");
  const [preMfaUser, setPreMfaUser] = useState(null);
  const auth = useAuthWrapper();
  const lockout = useLockout({ maxAttempts: 4, lockoutMinutes: 10 });
  useSessionTimeout({ inactivityMinutes: 5, absoluteMinutes: 60, onTimeout: (reason) => {
    console.log("session timeout due to", reason);
    auth.logout();
    setStage("login");
    alert(`Session ended (${reason}). Please sign in again.`);
  }});
  const onLoginSuccess = ({ preMfaUser: pmu, token, user }) => {
    if (pmu) {
      setPreMfaUser(pmu);
      setStage("mfa");
    } else if (token) {
      auth.loginWithToken(token, user);
      setStage("logged");
      lockout.reset();
    }
  };
  const onMfaVerified = ({ token, user }) => {
    auth.loginWithToken(token, user);
    setStage("logged");
    lockout.reset();
  };
  const handleLogout = () => {
    auth.logout();
    setStage("login");
  };
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {stage === "login" && <LoginForm onLoginSuccess={onLoginSuccess} lockout={lockout} />}
            {stage === "mfa" && preMfaUser && <MfaForm preMfaUser={preMfaUser} onVerified={onMfaVerified} />}
            {stage === "logged" && <AccountPanel onLogout={handleLogout} />}
          </div>
          <div>
            <div className="p-4 rounded shadow bg-white">
              <h4 className="font-semibold">Security features included</h4>
              <ul className="mt-2 text-sm list-disc list-inside">
                <li>Login via username, email or mobile (frontend accepts any identifier)</li>
                <li>Password reset & change flows (mocked)</li>
                <li>MFA (OTP) verification step</li>
                <li>Account lockout after repeated failed attempts (persistent via localStorage)</li>
                <li>Session timeout on inactivity + absolute timeout</li>
                <li>Basic IP & device capture (public IP via ipify and userAgent)</li>
              </ul>
            </div>
            <div className="mt-4 p-4 rounded shadow bg-white">
              <h4 className="font-semibold">Notes for backend</h4>
              <ol className="text-sm list-decimal list-inside mt-2">
                <li>Rate-limit login API and IPs, store failed attempts per account and IP.</li>
                <li>Use secure server-side session / JWT with refresh tokens and revocation.</li>
                <li>Send OTP via secure channel (SMS/email/TOTP) and support re-send throttling.</li>
                <li>Record device fingerprints & IPs for anomaly detection; alert on new devices.</li>
                <li>Store lockout metadata server-side too (don’t rely only on client-side lockout).</li>
              </ol>
            </div>
            <div className="mt-4 p-4 rounded shadow bg-white">
              <h4 className="font-semibold">Quick actions</h4>
              <div className="mt-2 flex gap-2">
                <button onClick={() => {
                  onLoginSuccess({ preMfaUser: { id: 1, name: 'Demo User', email: 'demo@example.com' } });
                }} className="px-3 py-2 rounded bg-blue-500 text-white">Demo Login (needs MFA)</button>
                <button onClick={() => { storage.set('demo_injected_at', Date.now()); alert('Demo flag set'); }} className="px-3 py-2 rounded border">Set demo flag</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

function useAuthWrapper() {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;
  const [user, setUser] = useState(() => storage.get("user") || null);
  const [token, setToken] = useState(() => storage.get("token") || null);
  const loginWithToken = (t, u) => {
    setToken(t);
    setUser(u);
    storage.set("token", t);
    storage.set("user", u);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    storage.remove("token");
    storage.remove("user");
  };
  return { user, token, loginWithToken, logout };
}
