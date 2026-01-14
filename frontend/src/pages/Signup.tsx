import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { Briefcase, Mail, Lock, User, AtSign, ArrowRight, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { showToast } from '@/lib/toast';
import { onSubmitAxios } from '@/lib/axios';
import { uploadToCloudinary } from '@/lib/cloudinary';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    avatarUrl: null as File | null,
    coverImage: null as File | null
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast(false, 'Please upload an image file');
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      showToast(false, 'File size must be less than 1MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        setAvatarPreview(reader.result as string);
        setFormData({ ...formData, avatarUrl: file });
      } else {
        setCoverPreview(reader.result as string);
        setFormData({ ...formData, coverImage: file });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type: 'avatar' | 'cover') => {
    if (type === 'avatar') {
      setAvatarPreview(null);
      setFormData({ ...formData, avatarUrl: null });
    } else {
      setCoverPreview(null);
      setFormData({ ...formData, coverImage: null });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      showToast(false, 'Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      showToast(false, 'Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast(false, 'Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast(false, 'Please enter a valid email');
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = '';
      let coverImageUrl = '';

      if (formData.avatarUrl) {
        try {
          const avatarData = await uploadToCloudinary(formData.avatarUrl, "image");
          avatarUrl = avatarData.secure_url;
        } catch (error) {
          showToast(false, 'Failed to upload profile picture');
          setIsLoading(false);
          return;
        }
      }

      if (formData.coverImage) {
        try {
          const coverData = await uploadToCloudinary(formData.coverImage, "image");
          coverImageUrl = coverData.secure_url;
        } catch (error) {
          showToast(false, 'Failed to upload cover image');
          setIsLoading(false);
          return;
        }
      }
      const response = await onSubmitAxios(
        "post",
        "auth/register",
        {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          ...(avatarUrl && { avatarUrl }),
          ...(coverImageUrl && { coverImage: coverImageUrl })
        }
      );
      if (response.status !== 201) {
        
     console.log(response)
        showToast(false, 'Something went wrong', response.data.message);
        setIsLoading(false);
        return;
      }

      dispatch(
        setUser({
          username: response.data.data.username,
          name: response.data.data.name,
          _id: response.data.data._id,
          avatarUrl: response.data.data.avatarUrl,
          coverImage: response.data.data.coverImage,
          email: response.data.data.email,
          createdAt: response.data.data.createdAt
        })
      );
      navigate("/gigs");
      showToast(true, 'Account created successfully!');
    } catch (error) {
      showToast(false, 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GigFlow</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Rahul"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="rahul"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Profile Picture</Label>
                <div className="flex items-center gap-3">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('avatar')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="avatarUrl"
                      className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                      <input
                        id="avatarUrl"
                        name="avatarUrl"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  )}
                  <div className="flex-1 text-xs text-gray-500">
                    Upload a profile picture (max 1MB)
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image </Label>
                <div className="space-y-2">
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-32 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('cover')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="coverImage"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Click to upload cover image</span>
                      <span className="text-xs text-gray-400">(max 1MB)</span>
                      <input
                        id="coverImage"
                        name="coverImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'cover')}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUp;