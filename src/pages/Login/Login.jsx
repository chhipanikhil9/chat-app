import React, { useState } from "react";
import "./Login.css";
import assets from "../../assets/assets";
import { login, signup, resetPass } from "../../config/firebase";
import { ToastContainer } from "react-toastify";

const Login = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign up") {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="login">
      <ToastContainer />
      <img src={assets.logo_big} alt="" className="logo" />
      <form className="login-form" onSubmit={onSubmitHandler}>
        <h2>{currState}</h2>
        {currState === "Sign up" ? (
          <input
            type="text"
            placeholder="userName"
            className="form-input"
            required
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            value={userName}
          />
        ) : null}
        <input
          type="text"
          placeholder="Email"
          className="form-input"
          required
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          value={email}
        />
        <input
          type="password"
          placeholder="Password"
          className="form-input"
          required
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          value={password}
        />
        <button type="submit">{currState}</button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="login-forgot">
          {
          currState === "Sign up" 
          ? (
            <p className="login-toggle">
              Already have an account{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                }}>
                Login here
              </span>
            </p>
          ) : (
            <p className="login-toggle">
              Create an account{" "}
              <span
                onClick={() => {
                  setCurrState("Sign up");
                }}>
                click here
              </span>
            </p>
          )}

          {
            currState==="Login"
            ? <p className="login-toggle">
            Forgot password ?{" "}
            <span
              onClick={() => {
                resetPass(email);
              }}>
              Reset here
            </span>
          </p>
          :null
          }
        </div>
      </form>
    </div>
  );
};

export default Login;
