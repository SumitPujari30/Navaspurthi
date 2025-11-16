import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Download,
  Search,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  X,
  Trophy
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const gradientPalette = [
  'from-[#F8C76F] to-[#D4AF37]',
  'from-[#FFB4D0] to-[#FF85A1]',
  'from-[#B980FF] to-[#8134AF]',
  'from-[#52E0C4] to-[#1EC8A6]',
  'from-[#F472B6] to-[#E11D48]'
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    activeEvents: 0,
    totalParticipants: 0
  });
  const [eventStats, setEventStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const parseEvents = (rawEvents) => {
    if (!rawEvents) return [];
    if (Array.isArray(rawEvents)) {
      // Handle array of objects with name property
      return rawEvents.map(e => {
        if (typeof e === 'string') return e;
        if (e && e.name) return e.name;
        return 'Unknown Event';
      });
    }
    if (typeof rawEvents === 'string') {
      try {
        const parsed = JSON.parse(rawEvents);
        if (Array.isArray(parsed)) {
          return parsed.map(e => {
            if (typeof e === 'string') return e;
            if (e && e.name) return e.name;
            return 'Unknown Event';
          });
        }
        return [rawEvents];
      } catch (err) {
        // If JSON parsing fails, try splitting by comma
        return rawEvents.includes(',') ? rawEvents.split(',').map(e => e.trim()) : [rawEvents];
      }
    }
    return [];
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (err) {
      return value;
    }
  };

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE}/api/registrations`);
      const records = response.data?.registrations || [];

      const formatted = records.map((record) => {
        const eventList = parseEvents(record.events);
        return {
          id: record.registration_id || record.id,
          name: record.full_name || 'N/A',
          email: record.email || 'N/A',
          phone: record.phone || 'N/A',
          college: record.college || 'N/A',
          events: eventList,
          participants: record.participants || [],
          totalParticipants: record.total_participants || (record.participants?.length ?? 0),
          registeredAt: formatDateTime(record.created_at),
          profileImageUrl: record.profile_image_url || null,
          idCardStatus: record.id_card_status || 'processing',
          idCardUrl: record.id_card_url || null
        };
      });

      const eventCountMap = formatted.reduce((acc, reg) => {
        if (reg.events && Array.isArray(reg.events)) {
          reg.events.forEach((eventName) => {
            if (eventName && typeof eventName === 'string') {
              const cleanEventName = eventName.trim();
              acc[cleanEventName] = (acc[cleanEventName] || 0) + 1;
            }
          });
        }
        return acc;
      }, {});

      setRegistrations(formatted);
      setStats((prev) => ({
        ...prev,
        totalRegistrations: formatted.length,
        activeEvents: Object.keys(eventCountMap).length,
        totalParticipants: formatted.reduce((sum, reg) => sum + reg.totalParticipants, 0)
      }));
      setEventStats(
        Object.entries(eventCountMap).map(([name, count], index) => ({
          name,
          registrations: count,
          color: gradientPalette[index % gradientPalette.length]
        }))
      );
    } catch (err) {
      console.error('Failed to load registrations:', err);
      setError('Unable to load registration data. Please try again.');
      setRegistrations([]);
      setEventStats([]);
      setStats((prev) => ({
        ...prev,
        totalRegistrations: 0,
        activeEvents: 0,
        totalParticipants: 0
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const idCardsReady = useMemo(
    () => registrations.filter(r => (r.idCardStatus || '').toLowerCase() === 'ready').length,
    [registrations]
  );

  // Filter registrations based on search
  useEffect(() => {
    let filtered = [...registrations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.name.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        reg.id.toLowerCase().includes(query) ||
        reg.phone.toLowerCase().includes(query) ||
        reg.college.toLowerCase().includes(query)
      );
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchQuery]);

  const renderLoadingState = () => (
    <div className="rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-br from-[#2B0718]/95 via-[#19010D]/96 to-[#060005]/98 p-12 text-center text-gold-light/70 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
      <p className="font-poppins">Loading dashboard data…</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="rounded-3xl border border-red-400/40 bg-red-500/10 p-12 text-center text-red-200 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
      <p className="font-poppins mb-4">{error}</p>
      <button
        type="button"
        onClick={fetchRegistrations}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] px-6 py-2 font-semibold text-[#3d0520] shadow-[0_12px_30px_rgba(244,208,63,0.3)] hover:shadow-[0_16px_38px_rgba(244,208,63,0.45)] transition"
      >
        Retry Loading Data
      </button>
    </div>
  );

  const renderActiveContent = () => {
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();

    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'registrations') return renderRegistrations();
    if (activeTab === 'events') return renderEvents();
    if (activeTab === 'analytics') return renderAnalytics();
    return null;
  };

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Phone', 'College', 'Events', 'Registered At'];
    const rows = filteredRegistrations.map(reg => [
      reg.id,
      reg.name,
      reg.email,
      reg.phone,
      reg.college,
      reg.events.join('; '),
      reg.registeredAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailsModal(true);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Registrations', value: stats.totalRegistrations, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Total Participants', value: stats.totalParticipants, icon: Activity, color: 'from-green-500 to-emerald-500' },
          { label: 'Active Events', value: stats.activeEvents, icon: Calendar, color: 'from-purple-500 to-pink-500' },
          { label: 'ID Cards Ready', value: idCardsReady, icon: BarChart3, color: 'from-orange-500 to-red-500' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#3a0c1f]/92 via-[#20030f]/95 to-[#090005]/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)] transition-all hover:border-gold hover:shadow-[0_32px_90px_rgba(212,175,55,0.25)]"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-[#f8c76f0b] via-transparent to-[#d4af370d]" aria-hidden="true"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-maroon shadow-[0_12px_30px_rgba(212,175,55,0.25)]`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-orbitron text-gold-light">{stat.value}</h3>
            <p className="text-sm text-gold-light/70 mt-1 font-poppins">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Event Registration Chart */}
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
          <h3 className="text-xl font-bold font-orbitron text-gold-light mb-6">Event Registrations</h3>
          <div className="space-y-4">
            {eventStats.map((event, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-gold-light/80 font-poppins">
                  <span className="font-semibold text-gold-light">{event.name}</span>
                  <span>{event.registrations} registrations</span>
                </div>
                <div className="relative h-3 sm:h-3.5 bg-[#3a0c1f] rounded-full overflow-hidden border border-gold/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.registrations / 300) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`absolute h-full bg-gradient-to-r ${event.color} rounded-full shadow-[0_6px_18px_rgba(212,175,55,0.25)]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Status Distribution */}
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
          <h3 className="text-xl font-bold font-orbitron text-gold-light mb-6">Registration Status</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gold-light/80 font-poppins">
                <span className="font-semibold text-gold-light">Confirmed</span>
                <span>{stats.confirmedRegistrations} registrations</span>
              </div>
              <div className="relative h-3 bg-[#3a0c1f] rounded-full overflow-hidden border border-gold/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalRegistrations > 0 ? (stats.confirmedRegistrations / stats.totalRegistrations) * 100 : 0}%` }}
                  transition={{ duration: 1 }}
                  className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-[0_6px_18px_rgba(16,185,129,0.35)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gold-light/80 font-poppins">
                <span className="font-semibold text-gold-light">Pending</span>
                <span>{stats.pendingApprovals} registrations</span>
              </div>
              <div className="relative h-3 bg-[#3a0c1f] rounded-full overflow-hidden border border-gold/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalRegistrations > 0 ? (stats.pendingApprovals / stats.totalRegistrations) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="absolute h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-[0_6px_18px_rgba(249,115,22,0.35)]"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#3a0c1f]/50 rounded-xl border border-gold/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold font-orbitron text-[#7EF1D7]">{stats.confirmedRegistrations}</p>
                  <p className="text-xs text-gold-light/70 mt-1">Confirmed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-orbitron text-[#F8C76F]">{stats.pendingApprovals}</p>
                  <p className="text-xs text-gold-light/70 mt-1">Pending</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {eventStats.slice(0, 4).map((event, index) => (
                <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-gold-light/80">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${event.color} shadow-[0_4px_12px_rgba(212,175,55,0.35)]`}></div>
                  <span className="truncate">{event.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold font-orbitron text-gold-light">Recent Registrations</h3>
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-gold-light px-4 py-2 rounded-full border border-gold/40 bg-gradient-to-r from-[#F8C76F]/10 to-[#D4AF37]/10 hover:border-gold hover:shadow-[0_12px_30px_rgba(212,175,55,0.25)] transition">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gold/15 text-gold-light/70 text-xs sm:text-sm uppercase tracking-[0.12em]">
                <th className="pb-3 font-semibold">ID</th>
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Events</th>
                <th className="pb-3 font-semibold">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {registrations.slice(0, 3).map((reg) => (
                <tr key={reg.id} className="border-b border-gold/10 text-sm text-gold-light/80 hover:bg-burgundy-light/10">
                  <td className="py-3 font-mono text-xs sm:text-sm text-gold-light/70">
                    <div className="max-w-[100px] truncate" title={reg.id}>{reg.id}</div>
                  </td>
                  <td className="py-3 font-semibold text-gold-light">
                    <div className="max-w-[120px] truncate" title={reg.name}>{reg.name}</div>
                  </td>
                  <td className="py-3 text-xs sm:text-sm">{reg.email}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {reg.events && reg.events.length > 0 ? (
                        <>
                          {reg.events.slice(0, 2).map((event, idx) => (
                            <span key={idx} className="text-[10px] sm:text-xs px-2 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold-light">
                              {event || 'Unknown Event'}
                            </span>
                          ))}
                          {reg.events.length > 2 && (
                            <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold-light">
                              +{reg.events.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full border border-gray-500/30 bg-gray-500/10 text-gray-400">
                          No Events
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">{reg.registeredAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 p-4 sm:p-6 shadow-[0_26px_75px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-light/60 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm rounded-xl bg-[#120109]/80 border border-gold/20 text-gold-light placeholder:text-gold-light/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="px-3 sm:px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#3d0520] font-semibold shadow-[0_16px_40px_rgba(244,208,63,0.35)] hover:shadow-[0_20px_50px_rgba(244,208,63,0.45)] transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
        <div className="mt-3 text-xs sm:text-sm text-gold-light/70">
          Showing {filteredRegistrations.length} of {registrations.length} registrations
        </div>
      </div>

      {/* Registrations Table */}
      <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-burgundy/30">
              <tr className="text-left">
                <th className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-light/70">ID</th>
                <th className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-light/70">Name</th>
                <th className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-light/70 hidden sm:table-cell">Email</th>
                <th className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-light/70 hidden md:table-cell">Phone</th>
                <th className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-light/70 hidden lg:table-cell">College</th>
                <th className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-light/70">Events</th>
                <th className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-light/70 hidden xl:table-cell">Date</th>
                <th className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold-light/70 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length > 0 ? filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="border-t border-gold/10 hover:bg-burgundy-light/10 transition">
                  <td className="px-3 sm:px-4 py-3">
                    <div className="font-mono text-[10px] sm:text-xs text-gold-light/70 max-w-[80px] sm:max-w-[100px] truncate" title={reg.id}>
                      {reg.id}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="font-semibold text-xs sm:text-sm text-gold-light max-w-[100px] sm:max-w-[120px] truncate" title={reg.name}>
                      {reg.name}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                    <div className="text-xs text-gold-light/80 max-w-[120px] sm:max-w-[150px] truncate" title={reg.email}>
                      {reg.email}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                    <div className="text-xs text-gold-light/80">
                      {reg.phone}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                    <div className="text-xs text-gold-light/80 max-w-[100px] sm:max-w-[120px] truncate" title={reg.college}>
                      {reg.college}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[150px] sm:max-w-[200px]">
                      {reg.events && reg.events.length > 0 ? (
                        reg.events.slice(0, 2).map((event, idx) => (
                          <span key={idx} className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-gold/30 bg-gold/10 text-gold-light whitespace-nowrap">
                            {event || 'Unknown'}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-gray-500/30 bg-gray-500/10 text-gray-400">
                          No Events
                        </span>
                      )}
                      {reg.events && reg.events.length > 2 && (
                        <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-gold/30 bg-gold/10 text-gold-light">
                          +{reg.events.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden xl:table-cell">
                    <div className="text-[10px] sm:text-xs text-gold-light/70">
                      {reg.registeredAt}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleViewDetails(reg)}
                        className="p-1.5 rounded-lg border border-gold/20 hover:border-gold hover:bg-gold/10 transition"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-light" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gold-light/60">
                    <div className="flex flex-col items-center gap-4">
                      <Users className="w-12 h-12 text-gold-light/30" />
                      <div>
                        <p className="text-base sm:text-lg font-semibold">No registrations found</p>
                        <p className="text-xs sm:text-sm mt-1">Registrations will appear here once users start signing up</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-8">
      {/* Events Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventStats.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#3a0c1f]/92 via-[#20030f]/95 to-[#090005]/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)] hover:border-gold hover:shadow-[0_32px_90px_rgba(212,175,55,0.25)] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${event.color} rounded-xl flex items-center justify-center shadow-[0_12px_30px_rgba(212,175,55,0.25)]`}>
                <Trophy className="w-5 h-5 text-maroon" />
              </div>
              <span className="text-2xl font-bold font-orbitron text-gold-light">{event.registrations}</span>
            </div>
            <h3 className="text-lg font-semibold text-gold-light mb-2">{event.name}</h3>
            <p className="text-sm text-gold-light/70">Total Registrations</p>
            <div className="mt-4 relative h-2 bg-[#3a0c1f] rounded-full overflow-hidden border border-gold/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(event.registrations / Math.max(...eventStats.map(e => e.registrations))) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`absolute h-full bg-gradient-to-r ${event.color} rounded-full`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* All Events List */}
      <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
        <h3 className="text-xl font-bold font-orbitron text-gold-light mb-6">All Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventStats.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-[#3a0c1f]/50 rounded-xl border border-gold/20 hover:border-gold/40 transition">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${event.color}`}></div>
                <span className="text-gold-light font-semibold">{event.name}</span>
              </div>
              <span className="text-gold-light/70 text-sm">{event.registrations} participants</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#3a0c1f]/92 via-[#20030f]/95 to-[#090005]/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
          <h4 className="text-sm text-gold-light/70 mb-2">Conversion Rate</h4>
          <p className="text-3xl font-bold font-orbitron text-gold-light">
            {stats.totalRegistrations > 0 ? Math.round((stats.confirmedRegistrations / stats.totalRegistrations) * 100) : 0}%
          </p>
          <p className="text-xs text-gold-light/60 mt-2">Confirmed vs Total</p>
        </div>
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#3a0c1f]/92 via-[#20030f]/95 to-[#090005]/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
          <h4 className="text-sm text-gold-light/70 mb-2">Avg. Events per User</h4>
          <p className="text-3xl font-bold font-orbitron text-gold-light">
            {stats.totalRegistrations > 0 ? (eventStats.reduce((sum, e) => sum + e.registrations, 0) / stats.totalRegistrations).toFixed(1) : 0}
          </p>
          <p className="text-xs text-gold-light/60 mt-2">Events / Registration</p>
        </div>
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#3a0c1f]/92 via-[#20030f]/95 to-[#090005]/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
          <h4 className="text-sm text-gold-light/70 mb-2">Most Popular Event</h4>
          <p className="text-xl font-bold font-orbitron text-gold-light truncate">
            {eventStats.length > 0 ? eventStats[0].name : 'N/A'}
          </p>
          <p className="text-xs text-gold-light/60 mt-2">{eventStats.length > 0 ? eventStats[0].registrations : 0} registrations</p>
        </div>
      </div>

      {/* Top Events Chart */}
      <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
        <h3 className="text-xl font-bold font-orbitron text-gold-light mb-6">Top 10 Events by Registration</h3>
        <div className="space-y-4">
          {eventStats.slice(0, 10).map((event, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm text-gold-light/80 font-poppins">
                <span className="font-semibold text-gold-light flex items-center gap-2">
                  <span className="text-gold-light/50">#{index + 1}</span>
                  {event.name}
                </span>
                <span>{event.registrations} registrations</span>
              </div>
              <div className="relative h-3 bg-[#3a0c1f] rounded-full overflow-hidden border border-gold/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(event.registrations / Math.max(...eventStats.map(e => e.registrations))) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`absolute h-full bg-gradient-to-r ${event.color} rounded-full shadow-[0_6px_18px_rgba(212,175,55,0.25)]`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
          <h3 className="text-xl font-bold font-orbitron text-gold-light mb-6">Registration Status Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#14322A] rounded-xl border border-[#7EF1D7]/30">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <span className="text-[#7EF1D7] font-semibold">Confirmed</span>
              </div>
              <span className="text-2xl font-bold text-[#7EF1D7]">{stats.confirmedRegistrations}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#3a2209] rounded-xl border border-[#F8C76F]/30">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                <span className="text-[#F8C76F] font-semibold">Pending</span>
              </div>
              <span className="text-2xl font-bold text-[#F8C76F]">{stats.pendingApprovals}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#060005]/98 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
          <h3 className="text-xl font-bold font-orbitron text-gold-light mb-6">Event Categories</h3>
          <div className="space-y-3">
            <div className="p-4 bg-[#3a0c1f]/50 rounded-xl border border-gold/20">
              <div className="flex justify-between items-center">
                <span className="text-gold-light font-semibold">Total Events</span>
                <span className="text-2xl font-bold text-gold-light">{stats.activeEvents}</span>
              </div>
            </div>
            <div className="p-4 bg-[#3a0c1f]/50 rounded-xl border border-gold/20">
              <div className="flex justify-between items-center">
                <span className="text-gold-light font-semibold">Total Participants</span>
                <span className="text-2xl font-bold text-gold-light">{eventStats.reduce((sum, e) => sum + e.registrations, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsModal = () => {
    if (!showDetailsModal || !selectedRegistration) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
        <div className="bg-gradient-to-br from-[#2B0718] via-[#19010D] to-[#060005] rounded-3xl p-8 max-w-2xl w-full border border-[#D4AF37]/40 shadow-[0_32px_90px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-orbitron font-bold text-gold-light">Registration Details</h2>
            <button onClick={() => setShowDetailsModal(false)} className="text-gold-light/70 hover:text-gold-light transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gold-light/60 mb-1">Registration ID</p>
                <p className="text-gold-light font-mono text-sm">{selectedRegistration.id}</p>
              </div>
              <div>
                <p className="text-sm text-gold-light/60 mb-1">Status</p>
                <span className={`inline-block text-xs px-3 py-1 rounded-full border ${
                  selectedRegistration.status === 'confirmed'
                    ? 'border-[#7EF1D7]/50 bg-[#14322A] text-[#7EF1D7]'
                    : selectedRegistration.status === 'cancelled'
                    ? 'border-[#FF8F8F]/50 bg-[#431018] text-[#FF8F8F]'
                    : 'border-[#F8C76F]/40 bg-[#3a2209] text-[#F8C76F]'
                }`}>
                  {selectedRegistration.status || 'pending'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gold-light/60 mb-1">Full Name</p>
              <p className="text-gold-light font-semibold">{selectedRegistration.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gold-light/60 mb-1">Email</p>
                <p className="text-gold-light text-sm">{selectedRegistration.email}</p>
              </div>
              <div>
                <p className="text-sm text-gold-light/60 mb-1">Phone</p>
                <p className="text-gold-light text-sm">{selectedRegistration.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gold-light/60 mb-1">College</p>
              <p className="text-gold-light text-sm">{selectedRegistration.college}</p>
            </div>

            <div>
              <p className="text-sm text-gold-light/60 mb-2">Events</p>
              <div className="flex flex-wrap gap-2">
                {selectedRegistration.events.map((event, idx) => (
                  <span key={idx} className="text-xs px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold-light">
                    {event}
                  </span>
                ))}
              </div>
            </div>

            {/* Participants Section */}
            {selectedRegistration.participants && selectedRegistration.participants.length > 0 && (
              <div>
                <p className="text-sm text-gold-light/60 mb-3">Participants ({selectedRegistration.participants.length})</p>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {selectedRegistration.participants.map((participant, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#3a0c1f]/50 border border-gold/20">
                      <div className="flex items-start gap-3">
                        {participant.profileImageUrl && (
                          <img 
                            src={participant.profileImageUrl} 
                            alt={participant.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-gold/30"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gold-light text-sm truncate">{participant.name || 'N/A'}</p>
                            {participant.idCardUrl && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                ID Ready
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gold-light/60 font-mono mb-1">ID: {participant.participantId || 'N/A'}</p>
                          {participant.email && (
                            <p className="text-xs text-gold-light/70 truncate">{participant.email}</p>
                          )}
                          {participant.idCardUrl && (
                            <a 
                              href={participant.idCardUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-xs text-gold hover:text-gold-light transition"
                            >
                              <Download className="w-3 h-3" />
                              View ID Card
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gold-light/60 mb-1">Registered At</p>
              <p className="text-gold-light text-sm">{selectedRegistration.registeredAt}</p>
            </div>

            {selectedRegistration.profileImageUrl && (
              <div>
                <p className="text-sm text-gold-light/60 mb-2">Profile Image</p>
                <img src={selectedRegistration.profileImageUrl} alt="Profile" className="w-32 h-32 rounded-lg object-cover border border-gold/30" />
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                const newStatus = selectedRegistration.status === 'confirmed' ? 'pending' : 'confirmed';
                handleUpdateStatus(selectedRegistration.id, newStatus);
                setShowDetailsModal(false);
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#3d0520] font-semibold shadow-[0_12px_30px_rgba(244,208,63,0.3)] hover:shadow-[0_16px_38px_rgba(244,208,63,0.45)] transition"
            >
              Toggle Status
            </button>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="px-6 py-2 rounded-xl border border-gold/30 text-gold-light font-semibold hover:border-gold hover:bg-gold/10 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-[#2B0718] via-[#18010E] to-[#060005]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 w-full relative overflow-hidden rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-br from-[#3a0c1f]/95 via-[#210612]/96 to-[#100208]/98 shadow-[0_32px_90px_rgba(0,0,0,0.35)] p-8">
            <div className="mb-10">
              <h2 className="text-2xl font-orbitron font-semibold text-gold-light">Admin Panel</h2>
              <p className="text-sm text-gold-light/70 font-poppins mt-1">Navaspurthi 2025 Control Center</p>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'registrations', label: 'Registrations', icon: Users },
                { id: 'events', label: 'Events', icon: Calendar },
                { id: 'analytics', label: 'Analytics', icon: PieChart }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-poppins text-sm transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-[#F8C76F]/25 to-[#D4AF37]/25 text-gold-light shadow-[0_16px_35px_rgba(212,175,55,0.15)] border border-gold/30'
                      : 'text-gold-light/70 hover:text-gold-light hover:bg-burgundy-light/20'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#3a0c1f]/92 via-[#20030f]/94 to-[#0a0005]/98 px-6 sm:px-10 py-8 shadow-[0_32px_90px_rgba(0,0,0,0.35)]">
              <h1 className="text-3xl sm:text-4xl font-orbitron font-bold text-gold-light">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gold-light/70 font-poppins">
                Monitor and manage every facet of Navaspurthi with precision.
              </p>
            </div>

            {renderActiveContent()}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {renderDetailsModal()}
    </div>
  );
};

export default AdminDashboard;
