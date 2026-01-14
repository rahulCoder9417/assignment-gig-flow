import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { onSubmitAxios } from '@/lib/axios'
import { setUser } from '@/store/slices/authSlice';
import { useAppSelector } from '@/store/hooks';
import { io, Socket } from "socket.io-client";
import { showToast } from '@/lib/toast';

export const ClientApp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isFetched, setIsFetched] = useState(false)
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const location = useLocation();
    const socketRef = useRef<Socket | null>(null);
    useEffect(() => {
      
        const fetchUser = async () => {
            try {
                const response = await onSubmitAxios("post", "users/login-via-access-token");
                 dispatch(
                        setUser({
                          username: response?.data.data.user.username,
                          name: response?.data.data.user.name,
                          _id: response?.data.data.user._id,
                          avatarUrl: response?.data.data.user.avatarUrl,
                          coverImage: response?.data.data.user.coverImage,
                          email: response?.data.data.user.email,
                          createdAt: response?.data.data.user.createdAt,
                        })
                      );

                      socketRef.current = await io(import.meta.env.VITE_BACKEND_WS_URL, {
                        withCredentials: true,
                      });
                      
                      socketRef.current.on("connect", () => {
                        console.log("Socket.IO connected:", socketRef.current?.id);
                      
                        socketRef.current?.emit("register", response.data.data.user._id);
                      });
                      
                      socketRef.current.on("connect_error", (error) => {
                        console.log("❌ Socket.IO connection error:", error.message);
                      });
                      socketRef.current.on("hire-notification", (data) => {
                        console.log("New bid received:", data);
                      
                        showToast(
                          true,
                          "Hired for " + data.title,
                          "",
                          true,
                          data.gigId,
                          navigate
                        );
                      });
                      
                      
                      socketRef.current.on("disconnect", () => {
                        console.log("Socket.IO disconnected");
                      });
                      
                    } catch (error) {
                //pass
            }
            setIsFetched(true)
           
        }
        fetchUser()
    }, [])
    useEffect(() => {
        if(!isFetched) return
        const authPages = ["/login", "/signup"];
        if (isAuthenticated && authPages.includes(location.pathname)) {
          navigate("/gigs", { replace: true });
        }
    
        if (!isAuthenticated && !authPages.includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
      }, [isAuthenticated, location.pathname, navigate, isFetched]);
    return null
    };