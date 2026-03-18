import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'interview'
  | 'offered'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: Date;
  isRead: boolean;
  withdrawnAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    coverLetter: String,
    resumeUrl: String,
    status: {
      type: String,
      enum: [
        'pending',
        'reviewing',
        'shortlisted',
        'interview',
        'offered',
        'hired',
        'rejected',
        'withdrawn',
      ],
      default: 'pending',
    },
    notes: String,
    interviewDate: Date,
    isRead: { type: Boolean, default: false },
    withdrawnAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

export default mongoose.model<IApplication>('Application', applicationSchema);