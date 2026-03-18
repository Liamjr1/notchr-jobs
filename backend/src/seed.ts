import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Company from './models/Company';
import Job from './models/Job';

dotenv.config();

const slugify = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
  '-' + Math.random().toString(36).slice(2, 7);

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Company.deleteMany({});
  await Job.deleteMany({});
  console.log('🗑️ Cleared existing data');

  // Create employer user
  const employer = await User.create({
    firstName: 'Chidi',
    lastName: 'Okeke',
    email: 'employer@notchr.com',
    password: 'password123',
    role: 'employer',
    isActive: true,
  });

  // Create jobseeker
  await User.create({
    firstName: 'Amaka',
    lastName: 'Obi',
    email: 'jobseeker@notchr.com',
    password: 'password123',
    role: 'jobseeker',
    isActive: true,
    skills: ['JavaScript', 'React', 'Node.js'],
    location: 'Lagos, Nigeria',
  });

  console.log('👤 Created users');

  // Create companies
  const companies = await Company.insertMany([
    {
      name: 'Flutterwave',
      slug: slugify('Flutterwave'),
      description: 'Flutterwave is a leading African payments technology company building payment infrastructure to connect Africa to the global economy.',
      industry: 'Technology',
      size: '201-500',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      website: 'https://flutterwave.com',
      founded: 2016,
      owner: employer._id,
      isVerified: true,
      isActive: true,
    },
    {
      name: 'Paystack',
      slug: slugify('Paystack'),
      description: 'Paystack helps businesses in Africa get paid by anyone, anywhere in the world. We are on a mission to accelerate payments across Africa.',
      industry: 'Finance',
      size: '51-200',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      website: 'https://paystack.com',
      founded: 2015,
      owner: employer._id,
      isVerified: true,
      isActive: true,
    },
    {
      name: 'Andela',
      slug: slugify('Andela'),
      description: 'Andela is a global talent network that connects companies with vetted, remote engineers from Africa and around the world.',
      industry: 'Technology',
      size: '501-1000',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      website: 'https://andela.com',
      founded: 2014,
      owner: employer._id,
      isVerified: true,
      isActive: true,
    },
    {
      name: 'Konga',
      slug: slugify('Konga'),
      description: 'Konga is one of Nigeria\'s largest e-commerce platforms, offering a wide range of products and services to millions of customers.',
      industry: 'Technology',
      size: '201-500',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      website: 'https://konga.com',
      founded: 2012,
      owner: employer._id,
      isVerified: false,
      isActive: true,
    },
    {
      name: 'Sterling Bank',
      slug: slugify('Sterling Bank'),
      description: 'Sterling Bank is a full service national commercial bank in Nigeria, providing banking services to individuals and businesses.',
      industry: 'Finance',
      size: '1000+',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      website: 'https://sterlingbank.com',
      founded: 1960,
      owner: employer._id,
      isVerified: true,
      isActive: true,
    },
  ]);

  console.log('🏢 Created companies');

  // Create jobs
  await Job.insertMany([
    {
      title: 'Senior Frontend Developer',
      slug: slugify('Senior Frontend Developer'),
      company: companies[0]._id,
      postedBy: employer._id,
      description: 'We are looking for a Senior Frontend Developer to join our growing engineering team. You will be responsible for building and maintaining our web applications.',
      requirements: [
        '5+ years of experience with React.js',
        'Strong understanding of JavaScript/TypeScript',
        'Experience with state management (Redux, Zustand)',
        'Knowledge of REST APIs and GraphQL',
      ],
      responsibilities: [
        'Build and maintain high-quality web applications',
        'Collaborate with designers and backend engineers',
        'Write clean, maintainable code',
        'Participate in code reviews',
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Remote work options',
        'Annual learning budget',
      ],
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Git'],
      jobType: 'full-time',
      experienceLevel: 'senior',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      isRemote: false,
      salary: { min: 500000, max: 800000, currency: 'NGN', period: 'monthly', isNegotiable: false },
      category: 'Technology',
      status: 'active',
      featured: true,
      urgent: false,
      tags: ['React', 'Frontend', 'JavaScript'],
    },
    {
      title: 'Product Manager',
      slug: slugify('Product Manager'),
      company: companies[1]._id,
      postedBy: employer._id,
      description: 'Paystack is looking for a Product Manager to help us build the next generation of payment products for Africa.',
      requirements: [
        '3+ years of product management experience',
        'Experience in fintech or payments',
        'Strong analytical and communication skills',
        'Ability to work cross-functionally',
      ],
      responsibilities: [
        'Define product vision and roadmap',
        'Work with engineering and design teams',
        'Analyze user feedback and metrics',
        'Launch new product features',
      ],
      benefits: [
        'Competitive compensation',
        'Stock options',
        'Medical coverage',
        'Flexible work hours',
      ],
      skills: ['Product Management', 'Agile', 'Analytics', 'Fintech'],
      jobType: 'full-time',
      experienceLevel: 'mid',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      isRemote: false,
      salary: { min: 600000, max: 900000, currency: 'NGN', period: 'monthly', isNegotiable: true },
      category: 'Technology',
      status: 'active',
      featured: true,
      urgent: true,
      tags: ['Product', 'Fintech', 'Management'],
    },
    {
      title: 'Backend Engineer (Node.js)',
      slug: slugify('Backend Engineer NodeJS'),
      company: companies[2]._id,
      postedBy: employer._id,
      description: 'Andela is seeking a skilled Backend Engineer to build scalable APIs and microservices for our talent platform.',
      requirements: [
        '3+ years Node.js experience',
        'Experience with MongoDB or PostgreSQL',
        'Knowledge of microservices architecture',
        'Familiarity with AWS or GCP',
      ],
      responsibilities: [
        'Design and build RESTful APIs',
        'Optimize database queries',
        'Implement security best practices',
        'Deploy and maintain services on cloud',
      ],
      benefits: [
        'Remote-first culture',
        'Competitive salary in USD',
        'Learning and development budget',
        'Global team exposure',
      ],
      skills: ['Node.js', 'MongoDB', 'AWS', 'Docker', 'TypeScript'],
      jobType: 'remote',
      experienceLevel: 'mid',
      location: 'Remote',
      country: 'Nigeria',
      isRemote: true,
      salary: { min: 400000, max: 700000, currency: 'NGN', period: 'monthly', isNegotiable: false },
      category: 'Technology',
      status: 'active',
      featured: false,
      urgent: false,
      tags: ['Node.js', 'Backend', 'Remote'],
    },
    {
      title: 'Digital Marketing Manager',
      slug: slugify('Digital Marketing Manager'),
      company: companies[3]._id,
      postedBy: employer._id,
      description: 'Konga is looking for a Digital Marketing Manager to lead our online marketing efforts and drive customer acquisition.',
      requirements: [
        '4+ years digital marketing experience',
        'Experience with Google Ads and Meta Ads',
        'Strong analytical skills',
        'E-commerce experience preferred',
      ],
      responsibilities: [
        'Manage digital marketing campaigns',
        'Optimize ad spend and ROI',
        'Analyze marketing metrics',
        'Develop content strategy',
      ],
      benefits: [
        'Performance bonuses',
        'Health insurance',
        'Staff discounts',
        'Career growth opportunities',
      ],
      skills: ['Google Ads', 'Meta Ads', 'SEO', 'Analytics', 'Content Marketing'],
      jobType: 'full-time',
      experienceLevel: 'senior',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      isRemote: false,
      salary: { min: 300000, max: 500000, currency: 'NGN', period: 'monthly', isNegotiable: false },
      category: 'Marketing',
      status: 'active',
      featured: false,
      urgent: false,
      tags: ['Marketing', 'Digital', 'E-commerce'],
    },
    {
      title: 'Data Analyst',
      slug: slugify('Data Analyst'),
      company: companies[4]._id,
      postedBy: employer._id,
      description: 'Sterling Bank is seeking a Data Analyst to help us make data-driven decisions and improve our banking products.',
      requirements: [
        '2+ years data analysis experience',
        'Proficiency in SQL and Python',
        'Experience with data visualization tools',
        'Banking or finance experience is a plus',
      ],
      responsibilities: [
        'Analyze large datasets',
        'Create dashboards and reports',
        'Identify trends and insights',
        'Present findings to stakeholders',
      ],
      benefits: [
        'Competitive salary',
        'Pension scheme',
        'Medical insurance',
        'Professional development',
      ],
      skills: ['SQL', 'Python', 'Power BI', 'Excel', 'Data Visualization'],
      jobType: 'full-time',
      experienceLevel: 'entry',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      isRemote: false,
      salary: { min: 200000, max: 350000, currency: 'NGN', period: 'monthly', isNegotiable: false },
      category: 'Finance',
      status: 'active',
      featured: false,
      urgent: false,
      tags: ['Data', 'Analytics', 'Finance'],
    },
    {
      title: 'UI/UX Designer',
      slug: slugify('UI UX Designer'),
      company: companies[0]._id,
      postedBy: employer._id,
      description: 'Flutterwave is looking for a talented UI/UX Designer to create beautiful and intuitive user experiences for our payment products.',
      requirements: [
        '3+ years UI/UX design experience',
        'Proficiency in Figma',
        'Strong portfolio of mobile and web designs',
        'Experience with user research',
      ],
      responsibilities: [
        'Design user interfaces for web and mobile',
        'Conduct user research and usability testing',
        'Create wireframes and prototypes',
        'Collaborate with product and engineering teams',
      ],
      benefits: [
        'Creative work environment',
        'Top design tools provided',
        'Health coverage',
        'Flexible hours',
      ],
      skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Adobe XD'],
      jobType: 'full-time',
      experienceLevel: 'mid',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      isRemote: false,
      salary: { min: 350000, max: 550000, currency: 'NGN', period: 'monthly', isNegotiable: false },
      category: 'Design',
      status: 'active',
      featured: true,
      urgent: false,
      tags: ['Design', 'UI', 'UX', 'Figma'],
    },
  ]);

  console.log('💼 Created jobs');
  console.log('');
  console.log('✅ Seed complete!');
  console.log('');
  console.log('Test accounts:');
  console.log('👔 Employer: employer@notchr.com / password123');
  console.log('👤 Jobseeker: jobseeker@notchr.com / password123');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});