const CLOUD_NAME = "dxlxwe55b";
const UPLOAD_PRESET = "zahraa_upload";

export async function uploadToCloudinary(file, folder="dawaty") {
  if (!file) throw new Error("اختر صورة أولاً.");
  if (!/^image\/(jpeg|png|webp|jpg)$/.test(file.type)) throw new Error("الصورة يجب أن تكون JPG أو PNG أو WEBP.");
  if (file.size > 8 * 1024 * 1024) throw new Error("حجم الصورة يجب ألا يتجاوز 8 ميجابايت.");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", folder);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:"POST", body:fd });
  const out = await r.json();
  if (!r.ok) throw new Error(out?.error?.message || "فشل رفع الصورة إلى Cloudinary.");
  return { url: out.secure_url, publicId: out.public_id, width: out.width, height: out.height };
}

export { CLOUD_NAME, UPLOAD_PRESET };
