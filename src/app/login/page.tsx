"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getEmailError } from "@/lib/auth-validation";
import { useLanguage } from "@/contexts/LanguageContext";

type AuthMode = "select" | "otp-email" | "otp-verify" | "password-login" | "password-signup";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ===== OTP 流程 =====
  const handleSendOTP = async () => {
    const emailError = getEmailError(email);
    if (emailError) { setError(emailError); return; }

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(t("login", "sendFailed"));
    } else {
      setMode("otp-verify");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError(t("login", "otpInvalid")); return; }

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
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
    if (error) setError(t("login", "resendFailed"));
    setLoading(false);
  };

  // ===== 密码登录 =====
  const handlePasswordLogin = async () => {
    const emailError = getEmailError(email);
    if (emailError) { setError(emailError); return; }
    if (password.length < 6) { setError(t("login", "passwordTooShort")); return; }

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // 如果没注册过，提示注册
      if (error.message.includes("Invalid login")) {
        setError(t("login", "invalidCredentials"));
      } else {
        setError(error.message);
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  // ===== 密码注册 =====
  const handlePasswordSignup = async () => {
    const emailError = getEmailError(email);
    if (emailError) { setError(emailError); return; }
    if (password.length < 6) { setError(t("login", "passwordTooShort")); return; }
    if (password !== confirmPassword) { setError(t("login", "passwordMismatch")); return; }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes("already registered")) {
        setError(t("login", "alreadyRegistered"));
      } else {
        setError(error.message);
      }
    } else {
      // Supabase 默认会发送确认邮件
      setSuccess(t("login", "signupSuccess"));
    }
    setLoading(false);
  };

  const resetState = () => {
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setShowPassword(false);
  };

  const inputClass = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 outline-none transition-all focus:border-[#5CC8D6] focus:ring-1 focus:ring-[#5CC8D6]/50";
  const btnPrimary = "flex w-full items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] transition-all hover:bg-[#7AD4DF] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111318] to-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(92,200,214,0.08)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4 sm:mx-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md"
      >
        {/* ========== 选择登录方式 ========== */}
        {mode === "select" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">{t("login", "title")}</h1>
              <p className="mt-2 text-sm text-neutral-400">{t("login", "subtitle")}</p>
            </div>

            {/* 邮箱输入 */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="name@example.com"
                className={inputClass}
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            {/* 两个按钮 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const emailError = getEmailError(email);
                  if (emailError) { setError(emailError); return; }
                  resetState();
                  setMode("password-login");
                }}
                disabled={!email}
                className={btnPrimary}
              >
                <Lock className="h-5 w-5" />
                {t("login", "passwordLogin")}
              </button>

              <button
                onClick={() => {
                  const emailError = getEmailError(email);
                  if (emailError) { setError(emailError); return; }
                  resetState();
                  handleSendOTPFromSelect();
                }}
                disabled={loading || !email}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-base font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                {t("login", "otpLogin")}
              </button>
            </div>

            <p className="text-center text-xs text-neutral-500">
              {t("login", "noAccountHint")}
            </p>
          </div>
        )}

        {/* ========== 密码登录 ========== */}
        {mode === "password-login" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5CC8D6]/10">
                <Lock className="h-7 w-7 text-[#5CC8D6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t("login", "passwordLogin")}</h1>
              <p className="mt-2 text-sm text-neutral-400">
                <span className="text-[#5CC8D6]">{email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                  placeholder={t("login", "passwordPlaceholder")}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-emerald-400">{success}</p>}
            </div>

            <button onClick={handlePasswordLogin} disabled={loading || !password} className={btnPrimary}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("login", "loginBtn")}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => { resetState(); setMode("select"); }}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("common", "back")}
              </button>
              <button
                onClick={() => { resetState(); setMode("password-signup"); }}
                className="text-neutral-400 hover:text-[#5CC8D6] transition-colors cursor-pointer"
              >
                {t("login", "goToSignup")}
              </button>
            </div>
          </div>
        )}

        {/* ========== 密码注册 ========== */}
        {mode === "password-signup" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <Lock className="h-7 w-7 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t("login", "signupTitle")}</h1>
              <p className="mt-2 text-sm text-neutral-400">
                <span className="text-[#5CC8D6]">{email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder={t("login", "setPasswordPlaceholder")}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSignup()}
                placeholder={t("login", "confirmPasswordPlaceholder")}
                className={inputClass}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-400">
                  {success}
                </div>
              )}
            </div>

            <button onClick={handlePasswordSignup} disabled={loading || !password || !confirmPassword} className={btnPrimary}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("login", "signupBtn")}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => { resetState(); setMode("select"); }}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("common", "back")}
              </button>
              <button
                onClick={() => { resetState(); setMode("password-login"); }}
                className="text-neutral-400 hover:text-[#5CC8D6] transition-colors cursor-pointer"
              >
                {t("login", "goToLogin")}
              </button>
            </div>
          </div>
        )}

        {/* ========== OTP: 邮箱 ========== */}
        {mode === "otp-email" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5CC8D6]/10">
                <Mail className="h-7 w-7 text-[#5CC8D6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t("login", "otpLogin")}</h1>
              <p className="mt-2 text-sm text-neutral-400">{t("login", "otpDesc")}</p>
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                placeholder="name@example.com"
                className={inputClass}
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <button onClick={handleSendOTP} disabled={loading || !email} className={btnPrimary}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("login", "sendCode")}
            </button>

            <button
              onClick={() => { resetState(); setMode("select"); }}
              className="flex items-center justify-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common", "back")}
            </button>
          </div>
        )}

        {/* ========== OTP: 验证码 ========== */}
        {mode === "otp-verify" && (
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
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className={btnPrimary}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("login", "verify")}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => { resetState(); setMode("select"); }}
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

  // 从选择页面直接发送 OTP
  function handleSendOTPFromSelect() {
    setLoading(true);
    setError(null);
    supabase.auth.signInWithOtp({ email }).then(({ error }) => {
      if (error) {
        setError(t("login", "sendFailed"));
        setMode("select");
      } else {
        setMode("otp-verify");
      }
      setLoading(false);
    });
  }
}
