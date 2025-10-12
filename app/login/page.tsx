"use client";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const LoginPage = () => {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await signIn("credentials",{
            email,password,redirect:false
        })
        if(res?.error){
            console.log("res.error")
        }else{
            router.push("/");
        }
    }
  return (
     <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='email'
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='password'
        />
        <button type="submit">Login</button>
      </form>
      <div>
        Don&apos;t have an account ?
        <button onClick={() => router.push("/register")}>Register</button>
      </div>
    </div>
  )
}

export default LoginPage