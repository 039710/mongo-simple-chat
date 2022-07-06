import React, { useEffect } from 'react'
import {logIn} from "../redux/actions"
import {useForm} from "react-hook-form"
import {useSelector, useDispatch} from 'react-redux'
import {useNavigate} from 'react-router-dom'
function Login() {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm();
  console.log(errors)
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
          <input {...register("email",{required: {
            value: true,
            message: "Email is required"
          },minLength:{
            value: 5,
            message: "Email must be at least 5 characters"
          }})} className="w-full p-2 rounded-md border-2 border-indigo-500" type="email" placeholder="Email" />
          <input {...register("password", { required:{
            value: true,
            message: "Password is required"
          }})}  className="w-full p-2 rounded-md border-2 border-indigo-500" type="password" placeholder="Password"/>
          <button className='px-3 py-1 rounded-sm bg-indigo-400 hover:bg-indigo-700 text-white font-bold w-[100px]'>Log in</button>
        </form>
        {
          Object.keys(errors).length > 0 &&
          <div className="text-white text-sm mt-5 w-[480px]">
              {Object.values(errors).map(error => <p className='font-semibold pl-3'><i className=" text-red-400 mr-2 fa-solid fa-circle-exclamation"></i>{error.message}</p>)}
          </div>


        }
      </div>
    </div>
  )
}

export default Login