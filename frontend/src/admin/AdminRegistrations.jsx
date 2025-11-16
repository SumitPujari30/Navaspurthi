// File: frontend/src/admin/AdminRegistrations.jsx
// Admin interface for managing registrations
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Download, RefreshCw, Eye, Trash2,
  ChevronDown, Grid, List, Mail, Image, Users,
  Calendar, Award, CheckCircle, Clock, X
} from 'lucide-react';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [filters, setFilters] = useState({
    search: '',
    event: '',
    year: '',
    status: '',
    limit: 50,
    offset: 0
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendingIdCards: 0,
    todayRegistrations: 0
  });

  // Fetch registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/admin/registrations?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      setRegistrations(data.registrations || []);
      setStats({
        total: data.total || 0,
        pendingIdCards: data.pendingIdCards || 0,
        todayRegistrations: data.todayRegistrations || 0
      });
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [filters]);

  // Export to CSV
  const exportToCSV = () => {
    const rows = selectedRows.length > 0 
      ? registrations.filter(r => selectedRows.includes(r.id))
      : registrations;

    const csv = [
      // Headers
      ['Registration ID', 'Name', 'Email', 'Phone', 'College', 'Year', 'Events', 'Team Size', 'Created At'].join(','),
      // Data
      ...rows.map(r => [
        r.registration_id,
        r.full_name,
        r.email,
        r.phone || '',
        r.college || '',
        r.year || '',
        Array.isArray(r.events) ? r.events.map(e => typeof e === 'string' ? e : e.name).join(';') : '',
        r.total_participants || 1,
        new Date(r.created_at).toLocaleDateString()
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Regenerate ID card
  const regenerateIdCard = async (registrationId) => {
    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}/regenerate-idcard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh the registration
        fetchRegistrations();
        alert('ID card regenerated successfully!');
      }
    } catch (error) {
      console.error('Error regenerating ID card:', error);
      alert('Failed to regenerate ID card');
    }
  };

  // Resend registration email
  const resendEmail = async (registrationId) => {
    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  // Table row component
  const TableRow = ({ registration }) => {
    const isSelected = selectedRows.includes(registration.id);
    
    return (
      <tr className="hover:bg-gray-800/50 border-b border-gray-700">
        <td className="p-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {
              if (isSelected) {
                setSelectedRows(prev => prev.filter(id => id !== registration.id));
              } else {
                setSelectedRows(prev => [...prev, registration.id]);
              }
            }}
            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
          />
        </td>
        <td className="p-3">
          {registration.profile_image_url ? (
            <img 
              src={registration.profile_image_url} 
              alt={registration.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {registration.full_name?.charAt(0).toUpperCase()}
            </div>
          )}
        </td>
        <td className="p-3 font-mono text-sm text-purple-400">
          {registration.registration_id}
        </td>
        <td className="p-3 text-white">
          {registration.full_name}
        </td>
        <td className="p-3 text-gray-300">
          {registration.email}
        </td>
        <td className="p-3 text-gray-300">
          {Array.isArray(registration.events) 
            ? registration.events.map(e => typeof e === 'string' ? e : e.name).join(', ')
            : registration.event}
        </td>
        <td className="p-3 text-center">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
            {registration.total_participants || 1}
          </span>
        </td>
        <td className="p-3 text-center">
          {registration.id_card_url ? (
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-400 mx-auto" />
          )}
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            {registration.id_card_url && (
              <a
                href={registration.id_card_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                title="Download ID Card"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => regenerateIdCard(registration.id)}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              title="Regenerate ID Card"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => resendEmail(registration.id)}
              className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              title="Resend Email"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Grid card component
  const GridCard = ({ registration }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-purple-500 transition-colors"
      >
        <div className="flex items-start gap-4">
          {registration.profile_image_url ? (
            <img 
              src={registration.profile_image_url} 
              alt={registration.full_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
              {registration.full_name?.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-white">{registration.full_name}</h3>
            <p className="text-xs text-purple-400 font-mono">{registration.registration_id}</p>
            <p className="text-sm text-gray-400 mt-1">{registration.email}</p>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Award className="w-4 h-4" />
                {Array.isArray(registration.events) 
                  ? registration.events.map(e => typeof e === 'string' ? e : e.name).join(', ')
                  : registration.event}
              </div>
              
              {registration.total_participants > 1 && (
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Users className="w-4 h-4" />
                  {registration.total_participants} participants
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Calendar className="w-4 h-4" />
                {new Date(registration.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              {registration.id_card_url && (
                <a
                  href={registration.id_card_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                >
                  ID Card
                </a>
              )}
              <button
                onClick={() => regenerateIdCard(registration.id)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Registration Management</h1>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-400">Total:</span>
              <span className="ml-2 font-semibold text-white">{stats.total}</span>
            </div>
            <div>
              <span className="text-gray-400">Pending ID Cards:</span>
              <span className="ml-2 font-semibold text-yellow-400">{stats.pendingIdCards}</span>
            </div>
            <div>
              <span className="text-gray-400">Today:</span>
              <span className="ml-2 font-semibold text-green-400">{stats.todayRegistrations}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, registration ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filters */}
            <select
              value={filters.event}
              onChange={(e) => setFilters({ ...filters, event: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Events</option>
              <option value="Solo Dance">Solo Dance</option>
              <option value="Group Dance">Group Dance</option>
              <option value="Cricket">Cricket</option>
              {/* Add all events */}
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Years</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="pending">ID Card Pending</option>
              <option value="ready">ID Card Ready</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-800 rounded-lg border border-gray-700">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-gray-400'} rounded-l-lg transition-colors`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400'} rounded-r-lg transition-colors`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            
            {selectedRows.length > 0 && (
              <button
                onClick={() => {
                  selectedRows.forEach(id => regenerateIdCard(id));
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Regenerate Selected ({selectedRows.length})
              </button>
            )}
            
            <button
              onClick={fetchRegistrations}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === registrations.length}
                      onChange={() => {
                        if (selectedRows.length === registrations.length) {
                          setSelectedRows([]);
                        } else {
                          setSelectedRows(registrations.map(r => r.id));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                    />
                  </th>
                  <th className="p-3 text-left">Photo</th>
                  <th className="p-3 text-left">Reg ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Events</th>
                  <th className="p-3 text-center">Team</th>
                  <th className="p-3 text-center">ID Card</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(registration => (
                  <TableRow key={registration.id} registration={registration} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registrations.map(registration => (
              <GridCard key={registration.id} registration={registration} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && registrations.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Showing {filters.offset + 1} to {Math.min(filters.offset + filters.limit, stats.total)} of {stats.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
                disabled={filters.offset === 0}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, offset: filters.offset + filters.limit })}
                disabled={filters.offset + filters.limit >= stats.total}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrations;
