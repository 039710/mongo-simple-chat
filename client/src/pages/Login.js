import React, { useEffect } from 'react'
import {logIn} from "../redux/actions"
import {useForm} from "react-hook-form"
import {useSelector, useDispatch} from 'react-redux'
import {useNavigate} from 'react-router-dom'
function Login() {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const {register, handleSubmit, errors} = useForm({shouldUseNativeValidation: false})
  const onSubmit = async (data) => {
    dispatch(logIn(data))
  }
  const navigator = useNavigate()
  useEffect(()=>{
    if (user?._id){
      navigator('/')
      localStorage.setItem('user',JSON.stringify(user))
    }
  },[user])
  useEffect(()=>{
    console.log('he')
    localStorage.removeItem('user')
    localStorage.removeItem('token')

  },[])
  return (
    <div className='h-screen w-screen flex bg-indigo-400 items-center justify-center'>
      <div className="w-[480px] h-[200px] bg-indigo-500 p-3 rounded-md flex flex-col items-center">
        <h1 className="text-white text-xl font-semibold">Login</h1>
        <form className='w-full py-2 flex flex-col space-y-2 items-end' onSubmit={handleSubmit(onSubmit)}>
          <input {...register("email",{required: "Please enter your email"})} className="w-full p-2 rounded-md border-2 border-indigo-500" type="text" placeholder="Email" />
          <input {...register("password", { required: "Please enter your password" })}  className="w-full p-2 rounded-md border-2 border-indigo-500" type="password" placeholder="Password"/>
          <button className='px-3 py-1 rounded-sm bg-indigo-400 hover:bg-indigo-700 text-white font-bold w-[100px]'>Log in</button>
        </form>
      </div>
    </div>
  )
}

export default Login