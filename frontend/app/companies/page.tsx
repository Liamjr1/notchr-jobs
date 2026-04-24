'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Building2, MapPin, Users, Loader2, CheckCircle } from 'lucide-react';
import { companiesAPI } from '@/lib/api';
import { Company } from '@/types';

const industries = [
  'Technology', 'Finance', 'Marketing', 'Design',
  'Healthcare', 'Education', 'Engineering', 'Sales',
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [total, setTotal] = useState(0);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.q = search;
      if (selectedIndustry) params.industry = selectedIndustry;
      const response = await companiesAPI.getCompanies(params);
      setCompanies(response.data.companies);
      setTotal(response.data.pagination.total);
    } catch {
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [selectedIndustry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Top Companies</h1>
          <p className="text-purple-200 mb-6">Discover great places to work across Nigeria</p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 flex-1">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 py-3 outline-none text-gray-900 placeholder-gray-400 bg-transparent"
              />
            </div>
            <button type="submit" className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Industry Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedIndustry('')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedIndustry === ''
                ? 'bg-purple-700 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-700'
            }`}
          >
            All Industries
          </button>
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedIndustry === ind
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-700'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        <p className="text-gray-500 mb-6">
          <span className="font-bold text-gray-900">{total}</span> companies found
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">Try a different search or industry filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Link key={company._id} href={`/companies/${company.slug}`}>
                <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className="w-8 h-8 text-purple-400" />
                      )}
                    </div>
                    {company.isVerified ? (
                      <span className="flex items-center gap-1 text-purple-700 text-xs font-semibold bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1 hover:text-purple-700 transition-colors">{company.name}</h3>
                  <p className="text-purple-700 text-sm font-semibold mb-3">{company.industry}</p>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{company.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {company.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {company.size} employees</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}