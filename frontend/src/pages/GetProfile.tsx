import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, Calendar, Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { onSubmitAxios } from '@/lib/axios';

// Interface based on your Mongoose Schema
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
  coverImage?: string;
  createdAt: string;
}

const GetProfile = () => {
  const { id } = useParams<{ id: string }>();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError('');
        
        // Using the provided onSubmitAxios function
        // Endpoint: users/get-profile/:id
        const response = await onSubmitAxios('get', `users/get-profile/${id}`);

        if (response.data && response.data.success) {
          // Assuming response.data.data holds the user object based on standard ApiResponse
          setProfile(response.data.data);
        } else {
          setError('Failed to load profile data');
        }
      } catch (err: any) {
        console.error('Fetch profile failed:', err);
        setError(err?.response?.data?.message || 'User not found or connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center px-4">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500">{error || "The user you are looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Cover Image Section */}
      <div className="relative h-64 bg-gradient-to-r from-gray-50 to-blue-50 overflow-hidden">
        {profile.coverImage ? (
          <img 
            src={profile.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-300 text-6xl">
              <User size={80} strokeWidth={1} />
            </div>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 pb-12">
        {/* Avatar and Info Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={60} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </div>

            {/* Name and Username */}
            <div className="pb-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {profile.name}
              </h1>
              <p className="text-gray-500 text-lg">
                @{profile.username}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Card - Read Only */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="text-gray-900 font-medium">{profile.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-gray-900 font-medium">{profile.email}</p>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Username</p>
                <p className="text-gray-900 font-medium">@{profile.username}</p>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Member Since</p>
                <p className="text-gray-900 font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetProfile;