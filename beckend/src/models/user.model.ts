import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt ,{ SignOptions }  from "jsonwebtoken"

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  username: string;
  coverImage?: string;
  refreshToken?: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatarUrl: { type: String },
    coverImage: { type: String },
    refreshToken: { type: String },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },

  },
  { timestamps: true }
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isPasswordCorrect = async function(password : string){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          email: this.email,
          name: this.name,
          avatarUrl: this.avatarUrl,
          coverImage: this.coverImage,
          username: this.username
      },
      process.env.ACCESS_TOKEN_SECRET! as string ,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY! as SignOptions["expiresIn"]
      }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          
      },
      process.env.REFRESH_TOKEN_SECRET! as string,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY! as SignOptions["expiresIn"]
      }
  )
}
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
