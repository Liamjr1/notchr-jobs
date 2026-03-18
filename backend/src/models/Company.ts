import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  description: string;
  industry: string;
  size: string;
  website?: string;
  location: string;
  country: string;
  state?: string;
  city?: string;
  founded?: number;
  linkedinUrl?: string;
  twitterUrl?: string;
  owner: mongoose.Types.ObjectId;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
    description: { type: String, required: true },
    industry: { type: String, required: true },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      required: true,
    },
    website: String,
    location: { type: String, required: true },
    country: { type: String, default: 'Nigeria' },
    state: String,
    city: String,
    founded: Number,
    linkedinUrl: String,
    twitterUrl: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1 });

export default mongoose.model<ICompany>('Company', companySchema);