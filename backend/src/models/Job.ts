import mongoose, { Document, Schema } from 'mongoose';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'remote';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'active' | 'paused' | 'closed' | 'draft';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  company: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  location: string;
  country: string;
  state?: string;
  city?: string;
  isRemote: boolean;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: 'monthly' | 'annual';
    isNegotiable: boolean;
  };
  deadline?: Date;
  status: JobStatus;
  views: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    requirements: [String],
    responsibilities: [String],
    benefits: [String],
    skills: [String],
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      required: true,
    },
    location: { type: String, required: true },
    country: { type: String, default: 'Nigeria' },
    state: String,
    city: String,
    isRemote: { type: Boolean, default: false },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'NGN' },
      period: { type: String, enum: ['monthly', 'annual'], default: 'annual' },
      isNegotiable: { type: Boolean, default: false },
    },
    deadline: Date,
    status: {
      type: String,
      enum: ['active', 'paused', 'closed', 'draft'],
      default: 'active',
    },
    views: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },
    tags: [String],
    category: { type: String, required: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ featured: 1 });

export default mongoose.model<IJob>('Job', jobSchema);