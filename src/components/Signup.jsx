import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 bg-gray-900 shadow-2xl rounded-lg border border-gray-700">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-[#f0f5f0]">Create Account</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800 text-[#f0f5f0] placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800 text-[#f0f5f0] placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-[#f0f5f0] font-semibold rounded-lg hover:from-green-600 hover:to-green-800 transition-transform transform hover:scale-105"
          >
            Sign Up
          </button>
        </form>
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative text-center">
            <span className="bg-gray-900 px-2 text-gray-400">or sign up with</span>
          </div>
        </div>
        <button
          onClick={handleGoogleSignup}
          className="w-full mt-4 py-3 bg-gray-800 text-[#f0f5f0] font-semibold rounded-lg hover:bg-gray-700 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <FcGoogle className="text-2xl" />  {/* Google icon */}
          <span>Sign Up with Google</span>
        </button>
        <p className="mt-6 text-center text-gray-400">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-500 underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
