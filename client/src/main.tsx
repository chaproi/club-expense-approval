import { useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { ExpenseRequests } from "./expense-requests.js";
import "./styles.css";

function Brand() {
  return <div className="brand"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m4 8 8-4 8 4-8 4-8-4Zm0 5 8 4 8-4M4 17l8 4 8-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span><div><h1>Club Expense Approval</h1><div className="brand-subtitle">Made for campus life</div></div></div>;
}

type User = {
  id: string;
  displayName: string;
  role: "REQUESTER" | "REVIEWER";
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { signal: controller.signal });
        if (response.ok) {
          setUser(await response.json());
        } else if (response.status !== 401) {
          setError("Could not check your session. Reload the page to retry.");
        }
      } catch {
        if (!controller.signal.aborted) setError("Could not connect to the server.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadUser();
    return () => controller.abort();
  }, []);

  async function logIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (!response.ok) {
        setError(response.status === 401 ? "Invalid email or password." : "Could not log in. Try again.");
        return;
      }
      setUser(await response.json());
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setPending(false);
    }
  }

  async function logOut() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError("Could not log out. Try again.");
        return;
      }
      setUser(null);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {loading ? (
        <div className="initial-session" id="main-content" tabIndex={-1}><Brand /><p role="status" className="loading">Checking your session…</p></div>
      ) : user ? (
        <>
          <header className="site-header">
            <Brand />
            <div className="account">
              <span className="avatar" aria-hidden="true">{user.displayName.slice(0, 1)}</span>
              <p className="account-text">Signed in as {user.displayName} ({user.role === "REQUESTER" ? "Requester" : "Reviewer"})</p>
              <button className="secondary" type="button" disabled={pending} onClick={() => void logOut()}>Log out</button>
            </div>
          </header>
          {error && <p role="alert" className="global-error">{error}</p>}
          <div id="main-content" tabIndex={-1}>
            <ExpenseRequests key={user.id} role={user.role} />
          </div>
        </>
      ) : (
        <div className="login-shell">
          <div className="login-art">
            <Brand />
            <p className="login-headline">Good ideas.<br /><em>Room to grow.</em></p>
            <img className="campus-art" src={new URL("./assets/campus.svg", import.meta.url).href} alt="" />
          </div>
          <div className="login-form-wrap entrance" id="main-content" tabIndex={-1}>
            <p className="eyebrow">Your club workspace</p>
            <h2>Welcome back.</h2>
            <p className="intro">Sign in to plan your next activity, submit expenses, and keep every approval together.</p>
            {error && <p role="alert">{error}</p>}
            <form className="login-form" aria-busy={pending} onSubmit={logIn}>
              <p><label>Email <input name="email" type="email" autoComplete="username" placeholder="you@university.edu" required /></label></p>
              <p><label>Password <input name="password" type="password" autoComplete="current-password" required /></label></p>
              <button type="submit" disabled={pending}>Log in</button>
            </form>
            <p className="login-footer">Use the account provided by your club administrator.</p>
          </div>
        </div>
      )}
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing app root.");
createRoot(root).render(<App />);
