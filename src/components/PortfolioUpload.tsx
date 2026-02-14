"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Plus, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  uploadPortfolioFile,
  createPortfolioItem,
  deletePortfolioItem,
  type DbPortfolio,
} from "@/lib/database";

interface PortfolioUploadProps {
  portfolios: DbPortfolio[];
  onUpdate: () => void;
}

export default function PortfolioUpload({ portfolios, onUpdate }: PortfolioUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    role_in_project: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制文件大小 20MB
    if (file.size > 20 * 1024 * 1024) {
      setError("文件大小不能超过 20MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    // 预览
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview("");
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile || !formData.title.trim()) {
      setError("请填写标题并选择文件");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // 上传文件到 Storage
      const mediaUrl = await uploadPortfolioFile(user.id, selectedFile);
      if (!mediaUrl) {
        setError("文件上传失败，请重试");
        setUploading(false);
        return;
      }

      // 创建作品记录
      const mediaType = selectedFile.type.startsWith("video/") ? "video" : "image";
      const item = await createPortfolioItem({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        media_url: mediaUrl,
        media_type: mediaType,
        year: formData.year,
        role_in_project: formData.role_in_project.trim(),
      });

      if (!item) {
        setError("保存作品记录失败");
        setUploading(false);
        return;
      }

      // 重置表单
      setFormData({ title: "", description: "", year: new Date().getFullYear(), role_in_project: "" });
      setSelectedFile(null);
      setFilePreview("");
      setShowForm(false);
      onUpdate();
    } catch {
      setError("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (portfolioId: string) => {
    setDeleting(portfolioId);
    const success = await deletePortfolioItem(portfolioId);
    if (success) {
      onUpdate();
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      {/* 已上传的作品 */}
      {portfolios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              {/* 封面 */}
              <div className="relative aspect-video bg-neutral-900">
                {item.media_type === "image" ? (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={item.media_url}
                    className="absolute inset-0 h-full w-full object-cover"
                    muted
                  />
                )}
                {/* 删除按钮 */}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded-lg bg-red-500/80 p-1.5 text-white hover:bg-red-500 transition-all cursor-pointer"
                >
                  {deleting === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* 信息 */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                  {item.year && <span>{item.year}</span>}
                  {item.role_in_project && (
                    <>
                      <span>·</span>
                      <span>{item.role_in_project}</span>
                    </>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 添加作品按钮 */}
      {!showForm && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/5 py-10 text-neutral-400 hover:border-[#5CC8D6]/40 hover:text-[#5CC8D6] transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          上传新作品
        </motion.button>
      )}

      {/* 上传表单 */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">上传作品</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                  setSelectedFile(null);
                  setFilePreview("");
                }}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* 文件选择 */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {filePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={filePreview} alt="预览" className="w-full aspect-video object-cover" />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview("");
                      }}
                      className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : selectedFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <ImageIcon className="h-8 w-8 text-[#5CC8D6]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{selectedFile.name}</p>
                      <p className="text-xs text-neutral-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="rounded-lg p-1 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-8 text-neutral-400 hover:border-[#5CC8D6]/40 hover:text-[#5CC8D6] transition-all cursor-pointer"
                  >
                    <Upload className="h-5 w-5" />
                    选择图片或视频
                  </button>
                )}
              </div>

              {/* 标题 */}
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="作品标题 *"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
              />

              {/* 描述 */}
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="作品描述（选填）"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50 resize-none"
              />

              {/* 年份和角色 */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData((p) => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  placeholder="年份"
                  min={2020}
                  max={2030}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                />
                <input
                  type="text"
                  value={formData.role_in_project}
                  onChange={(e) => setFormData((p) => ({ ...p, role_in_project: e.target.value }))}
                  placeholder="你的角色（如：摄影）"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                />
              </div>

              {/* 提交 */}
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !formData.title.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    上传作品
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
