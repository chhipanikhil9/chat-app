// upload image using cloudinary API
const upload = async (file) => {
  
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "ml_default");
  data.append("cloud_name", "dzcd6ywzc");


  const res = await fetch(
    import.meta.env.VITE_CLOUDINARY_URL,
    {
      method: "POST",
      body: data,
    },
  );
  if (!res.ok) {
    throw new Error("Failed to upload image");
  }
  const imgUrl = await res.json();
  return imgUrl.url;
};

export default upload;

