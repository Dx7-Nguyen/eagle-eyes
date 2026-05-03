import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Input, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { useAuth } from "../context/AuthContext.js";

const PASSWORD_RE = /^[a-zA-Z0-9]{8,128}$/;

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (pw.length > 128) return "Password must be 128 characters or fewer";
  if (!PASSWORD_RE.test(pw)) return "Password may only contain letters (A–Z, a–z) and numbers (0–9)";
  return null;
}

export function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/profile" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) { setError("First name is required"); return; }
    const pwErr = validatePassword(password);
    if (pwErr) { setError(pwErr); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setSubmitting(true);
    try {
      await register(email, password, firstName.trim());
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = {
    inputWrapper: "border-[#C8DDD0] hover:border-[#003D2B] focus-within:!border-[#003D2B]",
    label: "text-[#1A2E23]",
  };

  return (
    <div className="min-h-screen bg-[#F0F7F4] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block font-black text-[36px] tracking-widest uppercase text-[#003D2B] no-underline">
            Eagle Eyes
          </Link>
          <p className="text-[#4A6B57] mt-1 text-sm">Create your free account</p>
        </div>

        <Card className="border border-[#C8DDD0]" shadow="sm">
          <CardHeader className="px-6 pt-5 pb-0">
            <h2 className="text-[#003D2B] font-bold text-lg m-0">Create Account</h2>
          </CardHeader>
          <Divider className="mt-4" />
          <CardBody className="px-6 py-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <Input
                label="First Name"
                type="text"
                value={firstName}
                onValueChange={setFirstName}
                placeholder="Daniel"
                variant="bordered"
                classNames={inputClass}
                isRequired
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
                placeholder="you@example.com"
                variant="bordered"
                classNames={inputClass}
                isRequired
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onValueChange={setPassword}
                description="8–128 characters · letters and numbers only"
                variant="bordered"
                classNames={{ ...inputClass, description: "text-[#4A6B57]" }}
                isRequired
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onValueChange={setConfirm}
                variant="bordered"
                classNames={inputClass}
                isRequired
              />

              <Button
                type="submit"
                className="bg-[#003D2B] text-[#F5D130] font-bold w-full mt-1"
                isLoading={submitting}
                size="lg"
              >
                Create Account
              </Button>

              <p className="text-center text-sm text-[#4A6B57]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#003D2B] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardBody>
        </Card>

        <div className="mt-4 px-4 py-3 bg-white/70 rounded-lg border border-[#C8DDD0]">
          <p className="text-xs text-[#4A6B57] leading-relaxed">
            <strong className="text-[#003D2B]">Password requirements</strong><br />
            • 8 to 128 characters long<br />
            • Letters (A–Z, a–z) and numbers (0–9) only — no special characters
          </p>
        </div>
      </div>
    </div>
  );
}
