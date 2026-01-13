import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { onSubmitAxios } from '@/lib/axios'
import { setUser } from '@/store/slices/authSlice';
import { useAppSelector } from '@/store/hooks';

export const ClientApp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isFetched, setIsFetched] = useState(false)
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const location = useLocation();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await onSubmitAxios("post", "users/login-via-access-token");
                 dispatch(
                        setUser({
                          username: response?.data.data.user.username,
                          name: response?.data.data.user.name,
                          id: response?.data.data.user._id,
                          avatarUrl: response?.data.data.user.avatarUrl,
                          coverImage: response?.data.data.user.coverImage,
                          email: response?.data.data.user.email,
                          createdAt: response?.data.data.user.createdAt,
                        })
                      );
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