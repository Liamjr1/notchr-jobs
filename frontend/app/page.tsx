'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, MapPin, Briefcase, Users, Building2,
  ArrowRight, CheckCircle, TrendingUp, Shield, Zap,
} from 'lucide-react';

const categories = [
  { name: 'Technology', icon: '💻', count: 234 },
  { name: 'Finance', icon: '💰', count: 189 },
  { name: 'Marketing', icon: '📢', count: 156 },
  { name: 'Design', icon: '🎨', count: 98 },
  { name: 'Sales', icon: '📈', count: 145 },
  { name: 'Healthcare', icon: '🏥', count: 112 },
  { name: 'Education', icon: '🎓', count: 87 },
  { name: 'Engineering', icon: '⚙️', count: 203 },
];

const stats = [
  { label: 'Active Jobs', value: '2,400+', icon: Briefcase },
  { label: 'Companies', value: '800+', icon: Building2 },
  { label: 'Job Seekers', value: '50,000+', icon: Users },
  { label: 'Placements', value: '12,000+', icon: TrendingUp },
];

const features = [
  {
    icon: Zap,
    title: 'Quick Apply',
    description: 'Apply to multiple jobs with one click using your saved profile.',
  },
  {
    icon: Shield,
    title: 'Verified Companies',
    description: 'All companies are verified so you only apply to legitimate employers.',
  },
  {
    icon: TrendingUp,
    title: 'Track Applications',
    description: 'Monitor the status of all your applications in one dashboard.',
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-700 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-blue-200 text-sm font-medium">2,400+ jobs available right now</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Dream Job
            <span className="block text-blue-300 mt-2">in Nigeria</span>
          </h1>

          <p className="text-blue-200 text-xl mb-10 max-w-2xl mx-auto">
            Connect with top companies across Nigeria. Your next career move starts here.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl max-w-3xl mx-auto">
            <div className="flex items-center gap-3 flex-1 px-4">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, keyword or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 bg-transparent py-2"
              />
            </div>
            <div className="w-px bg-gray-200 hidden md:block"></div>
            <div className="flex items-center gap-3 flex-1 px-4">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="City or state..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 bg-transparent py-2"
              />
            </div>
            <button type="submit" className="btn-primary px-8 py-3 rounded-xl">
              Search Jobs
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Remote', 'Full-time', 'Tech', 'Finance', 'Marketing'].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/jobs?q=${tag}`)}
                className="text-blue-200 hover:text-white text-sm border border-blue-700 hover:border-blue-500 rounded-full px-4 py-1.5 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-500 text-lg">Find jobs in your field of expertise</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/jobs?category=${cat.name}`}
                className="card p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-200"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </div>
                <div className="text-gray-400 text-sm mt-1">{cat.count} jobs</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose NotcHR Jobs?</h2>
            <p className="text-gray-500 text-lg">Everything you need to land your next role</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of professionals who found their dream jobs through NotcHR.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2 justify-center">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/jobs" className="border border-blue-400 text-white hover:bg-blue-700 font-semibold px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2 justify-center">
              Browse Jobs
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {['Free to use', 'No hidden fees', 'Verified employers', 'Quick apply'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-xl">NotcHR Jobs</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
              <Link href="/companies" className="hover:text-white transition-colors">Companies</Link>
              <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
            <div className="text-sm">
              © 2024 NotcHR Jobs. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}