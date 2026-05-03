import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Input, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { useAuth } from "../context/AuthContext.js";

export function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/profile" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F7F4] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block font-black text-[36px] tracking-widest uppercase text-[#003D2B] no-underline">
            Eagle Eyes
          </Link>
          <p className="text-[#4A6B57] mt-1 text-sm">Sign in to your account</p>
        </div>

        <Card className="border border-[#C8DDD0]" shadow="sm">
          <CardHeader className="px-6 pt-5 pb-0">
            <h2 className="text-[#003D2B] font-bold text-lg m-0">Sign In</h2>
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
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
                placeholder="you@example.com"
                variant="bordered"
                classNames={{
                  inputWrapper: "border-[#C8DDD0] hover:border-[#003D2B] focus-within:!border-[#003D2B]",
                  label: "text-[#1A2E23]",
                }}
                isRequired
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-[#C8DDD0] hover:border-[#003D2B] focus-within:!border-[#003D2B]",
                  label: "text-[#1A2E23]",
                }}
                isRequired
              />

              <Button
                type="submit"
                className="bg-[#003D2B] text-[#F5D130] font-bold w-full mt-1"
                isLoading={submitting}
                size="lg"
              >
                Sign In
              </Button>

              <p className="text-center text-sm text-[#4A6B57]">
                Don't have an account?{" "}
                <Link to="/register" className="text-[#003D2B] font-semibold hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
