import { useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { ExpenseRequests } from "./expense-requests.js";

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
    <main>
      <h1>Club Expense Approval</h1>
      {error && <p role="alert">{error}</p>}
      {loading ? <p role="status">Checking your session…</p> : user ? (
        <>
          <p>Signed in as {user.displayName} ({user.role === "REQUESTER" ? "Requester" : "Reviewer"})</p>
          <button type="button" disabled={pending} onClick={() => void logOut()}>Log out</button>
          <ExpenseRequests key={user.id} role={user.role} />
        </>
      ) : (
        <form onSubmit={logIn}>
          <p><label>Email <input name="email" type="email" autoComplete="username" required /></label></p>
          <p><label>Password <input name="password" type="password" autoComplete="current-password" required /></label></p>
          <button type="submit" disabled={pending}>Log in</button>
        </form>
      )}
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing app root.");
createRoot(root).render(<App />);
