"use client";

import { useState, useRef } from "react";

export default function DebugUploadPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogs([]);
    addLog(`📁 文件: ${file.name}`);
    addLog(`📏 大小: ${(file.size / 1024).toFixed(0)} KB`);
    addLog(`🏷 类型: ${file.type || "(空)"}`);
    addLog(`📐 UA: ${navigator.userAgent.slice(0, 80)}`);

    // 1. 预览测试
    try {
      const url = URL.createObjectURL(file);
      setPreview(url);
      addLog("✅ createObjectURL 成功");
    } catch (err) {
      addLog(`❌ createObjectURL 失败: ${err}`);
    }

    // 2. createImageBitmap + resize 测试
    if (typeof createImageBitmap === "function") {
      // 2a. 带 resize
      try {
        const start = Date.now();
        const bitmap = await createImageBitmap(file, {
          resizeWidth: 400,
          resizeQuality: "medium",
        } as ImageBitmapOptions);
        addLog(`✅ createImageBitmap(resize) 成功: ${bitmap.width}x${bitmap.height}, ${Date.now() - start}ms`);

        // Canvas 导出测试
        try {
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
            const blob = await new Promise<Blob | null>((r) =>
              canvas.toBlob((b) => r(b), "image/jpeg", 0.82)
            );
            canvas.width = 0;
            canvas.height = 0;
            if (blob) {
              addLog(`✅ Canvas→JPEG 成功: ${(blob.size / 1024).toFixed(0)} KB`);
            } else {
              addLog("❌ Canvas→JPEG: blob 为 null");
            }
          }
        } catch (err) {
          addLog(`❌ Canvas 导出失败: ${err}`);
        }

        bitmap.close();
      } catch (err) {
        addLog(`⚠️ createImageBitmap(resize) 失败: ${err}`);
      }

      // 2b. 不带 resize
      try {
        const start = Date.now();
        const bitmap = await createImageBitmap(file);
        addLog(`✅ createImageBitmap(原始) 成功: ${bitmap.width}x${bitmap.height}, ${Date.now() - start}ms`);
        bitmap.close();
      } catch (err) {
        addLog(`❌ createImageBitmap(原始) 失败: ${err}`);
      }
    } else {
      addLog("⚠️ createImageBitmap 不可用");
    }

    // 3. Image 加载测试
    try {
      const start = Date.now();
      const result = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(`${img.naturalWidth}x${img.naturalHeight}, ${Date.now() - start}ms`);
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };
        img.src = url;
      });
      addLog(`✅ Image 加载成功: ${result}`);
    } catch (err) {
      addLog(`❌ Image 加载失败: ${err}`);
    }

    // 4. Cloudinary 直传测试（不压缩）
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    addLog(`☁️ Cloudinary: name=${cloudName || "缺失"}, preset=${uploadPreset || "缺失"}`);

    if (cloudName && uploadPreset) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);
        fd.append("folder", "debug-test");

        const start = Date.now();
        addLog("⏳ 正在上传到 Cloudinary...");
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: fd }
        );

        if (res.ok) {
          const data = await res.json();
          addLog(`✅ Cloudinary 上传成功: ${Date.now() - start}ms`);
          addLog(`   URL: ${data.secure_url}`);
        } else {
          const errText = await res.text();
          addLog(`❌ Cloudinary 上传失败: ${res.status}`);
          addLog(`   ${errText.slice(0, 200)}`);
        }
      } catch (err) {
        addLog(`❌ Cloudinary 请求异常: ${err}`);
      }
    }

    // 5. 翻译测试
    addLog("--- 翻译测试 ---");
    const testText = "寻找摄影师";
    for (const lang of ["en", "ja"] as const) {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=${lang}&dt=t&q=${encodeURIComponent(testText)}`;
        const resp = await fetch(url);
        if (resp.ok) {
          const data = await resp.json();
          const result = data?.[0]?.map((seg: unknown[]) => seg[0]).join("");
          addLog(`✅ 翻译→${lang}: "${testText}" → "${result}"`);
        } else {
          addLog(`❌ 翻译→${lang}: HTTP ${resp.status}`);
        }
      } catch (err) {
        addLog(`❌ 翻译→${lang} 异常: ${err}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-20">
      <h1 className="text-xl font-bold mb-4">📱 上传 & 翻译诊断</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-4 bg-[#5CC8D6] text-black font-bold rounded-xl mb-4 text-lg"
      >
        选择图片测试
      </button>

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-32 h-32 object-cover rounded-xl mb-4 border border-white/20"
        />
      )}

      <div className="bg-white/5 rounded-xl p-3 text-xs font-mono space-y-1 overflow-auto max-h-[60vh]">
        {logs.length === 0 && (
          <p className="text-neutral-500">选择一张图片开始诊断...</p>
        )}
        {logs.map((log, i) => (
          <p key={i} className={
            log.includes("❌") ? "text-red-400" :
            log.includes("✅") ? "text-green-400" :
            log.includes("⚠️") ? "text-yellow-400" :
            "text-neutral-300"
          }>
            {log}
          </p>
        ))}
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        请截图此页面的诊断结果发给开发者
      </p>
    </div>
  );
}
