"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Plus,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Youtube,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  createPortfolioItem,
  deletePortfolioItem,
  uploadToCloudinary,
  extractYouTubeId,
  getYouTubeThumbnail,
  type DbPortfolio,
} from "@/lib/database";

interface PortfolioUploadProps {
  portfolios: DbPortfolio[];
  onUpdate: () => void;
}

type UploadType = "youtube" | "image";

export default function PortfolioUpload({
  portfolios,
  onUpdate,
}: PortfolioUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("youtube");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    role_in_project: "",
    youtubeUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("文件大小不能超过 20MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("只支持图片文件，视频请使用 YouTube 链接");
      return;
    }

    setSelectedFile(file);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!user || !formData.title.trim()) {
      setError("请填写作品标题");
      return;
    }

    setUploading(true);
    setError("");

    try {
      let mediaUrl = "";
      let mediaType = "";

      if (uploadType === "youtube") {
        const videoId = extractYouTubeId(formData.youtubeUrl);
        if (!videoId) {
          setError("请输入有效的 YouTube 视频链接");
          setUploading(false);
          return;
        }
        mediaUrl = formData.youtubeUrl.trim();
        mediaType = "youtube";
      } else {
        if (!selectedFile) {
          setError("请选择图片文件");
          setUploading(false);
          return;
        }

        const cloudinaryUrl = await uploadToCloudinary(selectedFile);
        if (!cloudinaryUrl) {
          setError("图片上传失败，请检查 Cloudinary 配置或重试");
          setUploading(false);
          return;
        }
        mediaUrl = cloudinaryUrl;
        mediaType = "image";
      }

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

      setFormData({
        title: "",
        description: "",
        year: new Date().getFullYear(),
        role_in_project: "",
        youtubeUrl: "",
      });
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

  const handleCardClick = (item: DbPortfolio) => {
    if (item.media_type === "youtube") {
      const videoId = extractYouTubeId(item.media_url);
      if (videoId) {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
      } else {
        window.open(item.media_url, "_blank");
      }
    } else if (item.media_type === "image") {
      window.open(item.media_url, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* 提示文字 */}
      <p className="text-xs text-neutral-500 flex items-center gap-1.5">
        <LinkIcon className="h-3 w-3" />
        为了保证加载速度，视频请直接粘贴外部链接，图片将通过云端自动压缩
      </p>

      {/* 已上传的作品 */}
      {portfolios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((item) => {
            const isYouTube = item.media_type === "youtube";
            const videoId = isYouTube
              ? extractYouTubeId(item.media_url)
              : null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-all"
                onClick={() => handleCardClick(item)}
              >
                {/* 封面 */}
                <div className="relative aspect-video bg-neutral-900">
                  {isYouTube && videoId ? (
                    <>
                      <img
                        src={getYouTubeThumbnail(videoId)}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90">
                          <Youtube className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  {/* 类型标识 */}
                  <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white/70 flex items-center gap-1">
                    <ExternalLink className="h-2.5 w-2.5" />
                    {isYouTube ? "YouTube" : "图片"}
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
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
                  <h3 className="text-sm font-medium text-white truncate">
                    {item.title}
                  </h3>
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
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
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
          添加新作品
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
              <h3 className="text-base font-semibold text-white">添加作品</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                  setSelectedFile(null);
                  setFilePreview("");
                  setFormData((p) => ({ ...p, youtubeUrl: "" }));
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
              {/* 类型切换 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadType("youtube")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all cursor-pointer ${
                    uploadType === "youtube"
                      ? "bg-red-500/20 border border-red-500/40 text-red-400"
                      : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  <Youtube className="h-4 w-4" />
                  YouTube 视频链接
                </button>
                <button
                  onClick={() => setUploadType("image")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all cursor-pointer ${
                    uploadType === "image"
                      ? "bg-[#5CC8D6]/20 border border-[#5CC8D6]/40 text-[#5CC8D6]"
                      : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  图片作品
                </button>
              </div>

              {/* YouTube 链接输入 */}
              {uploadType === "youtube" && (
                <div>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, youtubeUrl: e.target.value }))
                    }
                    placeholder="粘贴 YouTube 视频链接（如：https://youtu.be/...）"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-red-500/50"
                  />
                  {formData.youtubeUrl &&
                    extractYouTubeId(formData.youtubeUrl) && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={getYouTubeThumbnail(
                            extractYouTubeId(formData.youtubeUrl)!
                          )}
                          alt="视频预览"
                          className="w-full aspect-video object-cover"
                        />
                      </div>
                    )}
                  <p className="mt-2 text-xs text-neutral-500">
                    支持 youtube.com/watch、youtu.be、youtube.com/shorts 链接
                  </p>
                </div>
              )}

              {/* 图片选择 */}
              {uploadType === "image" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {filePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={filePreview}
                        alt="预览"
                        className="w-full aspect-video object-cover"
                      />
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
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-8 text-neutral-400 hover:border-[#5CC8D6]/40 hover:text-[#5CC8D6] transition-all cursor-pointer"
                    >
                      <Upload className="h-5 w-5" />
                      选择图片（自动云端压缩）
                    </button>
                  )}
                  <p className="mt-2 text-xs text-neutral-500">
                    支持 JPG、PNG 格式，上传后将通过 Cloudinary 自动压缩优化
                  </p>
                </div>
              )}

              {/* 标题 */}
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="作品标题 *"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
              />

              {/* 描述 */}
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="作品描述（选填）"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50 resize-none"
              />

              {/* 年份和角色 */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      year:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    }))
                  }
                  placeholder="年份"
                  min={2020}
                  max={2030}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                />
                <input
                  type="text"
                  value={formData.role_in_project}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, role_in_project: e.target.value }))
                  }
                  placeholder="你的角色（如：摄影）"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#5CC8D6]/50"
                />
              </div>

              {/* 提交 */}
              <button
                onClick={handleUpload}
                disabled={
                  uploading ||
                  !formData.title.trim() ||
                  (uploadType === "youtube" && !formData.youtubeUrl.trim()) ||
                  (uploadType === "image" && !selectedFile)
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5CC8D6] py-3 text-base font-semibold text-[#050505] hover:bg-[#7AD4DF] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {uploadType === "image" ? "上传压缩中..." : "保存中..."}
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    添加作品
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
