import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Camera, Edit2, Save, X, User, Mail, Calendar, Loader2 } from 'lucide-react';
import { setUser } from '@/store/slices/authSlice';
import { onSubmitAxios } from '@/lib/axios';
import { useAppSelector } from '@/store/hooks';
import Header from '@/components/Header';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { showToast } from '@/lib/toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
          name: user.name || '',
        username: user.username || '',
      });
    }
  }, [user]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleImageUpload = async (type: 'avatar' | 'cover') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        showToast(false,'Image size should be less than 1MB', 'error');
        return;
      }

      setIsUploading(true);
      setError('');
      
      try {
       
        const url = await uploadToCloudinary(file);
        let body = {}
        if(type === 'avatar'){
          body = {
            avatarUrl: url.secure_url
          }
        }else{
          body = {
            coverImage: url.secure_url
          }
        }
        const endpoint = type === 'avatar' ? 'users/avatar' : 'users/cover-image';
        const response = await onSubmitAxios('patch', endpoint, body);
        console.log(response)
        if (response.data && response.data.success&&user) {
          
dispatch(
  setUser({
    ...user,
    ...(type === 'avatar'
      ? { avatarUrl: url.secure_url }
      : { coverImage: url.secure_url }),
  })
);
          setSuccess(`${type === 'avatar' ? 'Avatar' : 'Cover image'} updated successfully!`);
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error:any) {
        console.error('Upload failed:', error);
        showToast(false,'Failed to upload image', error?.response?.data?.message || 'Failed to upload image');
        setError(error?.response?.data?.message || 'Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    };
    
    input.click();
  };

  const handleSaveProfile = async () => {
    if (!formData.name && !formData.username) {
      setError('At least one field is required');
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      const response = await onSubmitAxios('patch', 'users/update-account', {
        name: formData.name,
        username: formData.username
      });

      if (response.data && response.data.success&&user) {
        // Update Redux store with updated user data
        dispatch(setUser({
          ...user,
          name: formData.name,
          username: formData.username
        }));
        setIsEditingProfile(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error:any) {
      console.error('Update failed:', error);
      setError(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
    });
    setIsEditingProfile(false);
    setError('');
  };

  return (
    <div  className="min-h-screen bg-white">
      <Header/>
      

      {/* Cover Image Section */}
      <div className="relative h-64 bg-gradient-to-r from-gray-50 to-blue-50 overflow-hidden">
        {user?.coverImage ? (
          <img 
            src={user.coverImage} 
            
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
        
        <button
          onClick={() => handleImageUpload('cover')}
          disabled={isUploading}
          className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Camera size={18} />
          )}
          <span className="text-sm font-medium">
            {isUploading ? 'Uploading...' : 'Change Cover'}
          </span>
        </button>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 pb-12">
        {/* Avatar and Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={60} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <button
                onClick={() => handleImageUpload('avatar')}
                disabled={isUploading}
                className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>
            </div>

            {/* Name and Username */}
            <div className="pb-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {user?.name || 'User Name'}
              </h1>
              <p className="text-gray-500 text-lg">
                @{user?.username || 'username'}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg border border-gray-200 transition-all flex items-center gap-2 shadow-sm"
            >
              <Edit2 size={18} />
              <span className="font-medium">Edit Profile</span>
            </button>
          )}
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {isEditingProfile ? (
            // Edit Mode
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Profile Information</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="text-gray-900 font-medium">{user?.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-medium">{user?.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <p className="text-gray-900 font-medium">@{user?.username || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Member Since</p>
                    <p className="text-gray-900 font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      }) : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;