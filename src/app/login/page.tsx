"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getEmailError } from "@/lib/auth-validation";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const emailError = getEmailError(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setError(t("login", "sendFailed"));
    } else {
      setStep("otp");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError(t("login", "otpInvalid"));
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setError(t("login", "otpWrong"));
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(t("login", "resendFailed"));
    } else {
      setError(null);
    }
    setLoading(false);
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111318] to-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(92,200,214,0.08)_0%,transparent_70%)]" />

      {/* 登录卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4 sm:mx-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md"
      >
        {step === "email" ? (
          /* 步骤 1：输入邮箱 */
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5CC8D6]/10">
                <Mail className="h-7 w-7 text-[#5CC8D6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t("login", "title")}</h1>
              <p className="mt-2 text-sm text-neutral-400">
                {t("login", "subtitle")}
              </p>
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                placeholder="name@university.ac.jp"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 outline-none transition-all focus:border-[#5CC8D6] focus:ring-1 focus:ring-[#5CC8D6]/50"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading || !email}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                t("login", "sendCode")
              )}
            </button>
          </div>
        ) : (
          /* 步骤 2：输入验证码 */
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5CC8D6]/10">
                <ShieldCheck className="h-7 w-7 text-[#5CC8D6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t("login", "enterCode")}</h1>
              <p className="mt-2 text-sm text-neutral-400">
                {t("login", "codeSentTo")}
                <span className="text-[#5CC8D6]">{email}</span>
              </p>
            </div>

            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                placeholder="000000"
                maxLength={6}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.3em] text-white placeholder-neutral-600 outline-none transition-all focus:border-[#5CC8D6] focus:ring-1 focus:ring-[#5CC8D6]/50"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                t("login", "verify")
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError(null);
                }}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("common", "back")}
              </button>
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-neutral-400 hover:text-[#5CC8D6] transition-colors cursor-pointer disabled:opacity-50"
              >
                {t("login", "resend")}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
