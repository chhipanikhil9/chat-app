import React, { useContext, useEffect } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const {setUserData} = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        if (userData.name) {
          setName(userData.name);
        }
        if (userData.bio) {
          setBio(userData.bio);
        }
        if (userData.avatar) {
          setPrevImage(userData.avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, []);

  const ProfileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Upload profile picture");
        return;
      } 
      const docRef = doc(db,'users',uid);

      if(image){
        const imgUrl = await upload(image);
        setPrevImage(imgUrl);

        await updateDoc(docRef,{
          avatar: imgUrl,
          bio: bio,
          name:name
        });
      }
      else{
        await updateDoc(docRef,{
          bio: bio,
          name:name
        });
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate("/chat");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={ProfileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png .jpg .jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : assets.avatar_icon}
              alt=""
            />
            Upload profile image
          </label>
          <input
            onChange={(e) => {
              setName(e.target.value);
            }}
            value={name}
            type="text"
            placeholder="Your name"
          />
          <textarea
            onChange={(e) => {
              setBio(e.target.value);
            }}
            value={bio}
            placeholder="Write your profile bio..."></textarea>
          <button type="submit">Save</button>
        </form>
        <img
          className="profile-pic"
          src={image ? URL.createObjectURL(image) :(prevImage?prevImage:assets.logo_icon)}
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
