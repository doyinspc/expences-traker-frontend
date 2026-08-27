import React, { useState, useEffect } from 'react';
import useReduxApiData from '../../../hooks/useTanstackQuery';
import { useNavigate } from 'react-router';
import { storeTitleRow } from '../../../utils/functions/basci';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

// ==================== TYPES ====================

export interface Client {
  id: number | string | null;
  name: string;
  phone: string;
  email: string;
  company_id?: string;
  company_name?: string;
  created_at?: string;
  cat?: string;
  table?: string;
  narration?: string;
}

export interface Company {
  id: number | string | null;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  cat?: string;
  table?: string;
  narration?: string;
  created_at?: string;
}

export interface Booking {
  id: number;
  room_id: number;
  room_name: string;
  room_parent_id: number;
  date: string;
  client_id: number;
  client_name: string;
  client_phone: string;
  client_email: string;
  company_id?: string;
  company_name?: string;
  is_booked: 0 | 1;
  is_lodged: 0 | 1;
  is_vacated: 0 | 1;
}

export interface ClientWithBookings extends Client {
  bookings?: Booking[];
  total_bookings?: number;
  active_bookings?: number;
  rooms?: string[];
}

// ==================== PROPS ====================

interface ClientManagementProps {
  clientsEndpoint?: string;
  bookingsEndpoint?: string;
  companiesEndpoint?: string;
  onClientSelect?: (client: Client) => void;
  onClientCreated?: (client: Client) => void;
  onBookingView?: (booking: Booking) => void;
  searchClients?: (searchTerm: string) => Promise<Client[]>;
  createClient?: (clientData: Partial<Client>) => Promise<Client>;
  createCompany?: (companyData: Partial<Company>) => Promise<Company>;
  allowAddClient?: boolean;
  allowAddCompany?: boolean;
}

// ==================== COMPONENT ====================

export default function ClientManagement({
  clientsEndpoint = "clients",
  bookingsEndpoint = "bookings",
  companiesEndpoint = "companies",
  onClientSelect,
  onClientCreated,
  onBookingView,
  searchClients,
  createClient,
  createCompany,
  allowAddClient = true,
  allowAddCompany = true,
}: ClientManagementProps) {

  const nav = useNavigate()
  
  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState<boolean>(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState<boolean>(false);
  const [showClientDetails, setShowClientDetails] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    company_id: '',
    company_name: ''
  });
  const [companyForm, setCompanyForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: ''
  });

  const {location_id} = useSelector((state:any) =>state.auth)

  // ==================== TOAST FUNCTIONS ====================

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const styles = {
      success: {
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      },
      error: {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      },
      warning: {
        icon: '⚠️',
        style: {
          background: '#F59E0B',
          color: '#fff',
          fontWeight: '500',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#F59E0B',
        },
      },
      info: {
        icon: 'ℹ️',
        style: {
          background: '#3B82F6',
          color: '#fff',
          fontWeight: '500',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#3B82F6',
        },
      },
    };

    const config = styles[type];
    toast(message, {
      duration: 3000,
      position: 'bottom-right',
      style: config.style,
      icon: config.icon,
      iconTheme: config.iconTheme,
      className: 'custom-toast',
    });
  };

  // ==================== CONFIRMATION DIALOG ====================

  const showConfirmDialog = async (title: string, text: string, confirmButtonText: string = 'Yes, proceed!'): Promise<boolean> => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#EF4444',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.5)',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'px-6 py-2.5 rounded-lg font-medium transition-colors hover:bg-blue-600',
        cancelButton: 'px-6 py-2.5 rounded-lg font-medium transition-colors hover:bg-red-600',
      },
    });
    return result.isConfirmed;
  };

  // Fetch all clients with bookings
  const {
    data: clientsData,
    loadQuery: loadClients,
    isLoading: isLoadingClients,
    loadUpdate: loadUpdateClient,
    error: clientsError
  } = useReduxApiData({
    table: clientsEndpoint,
    uniqueKey: "clients",
    queryType: 'gets',
    mainParam: {location_id},
    narration: 'get all clients'
  });

  const {
    data: searchResultsData,
    loadQuery: loadClientSearch,
    isLoading: isSearching,
    error: clientsSearchError
  } = useReduxApiData({
    table: clientsEndpoint,
    uniqueKey: "clientsearch",
    queryType: 'searchClients',
    mainParam: {location_id},
    narration: 'search clients',
  });

  const {
    data: companies,
    loadQuery: loadCompanies,
    isLoading: isLoadingCompanies,
    loadUpdate: loadUpdateCompanies,
    error: companiesError
  } = useReduxApiData({
    table: companiesEndpoint,
    uniqueKey: "companies",
    queryType: 'gets',
    mainParam: {},
    narration: 'get all companies'
  });

  // Fetch bookings - get ALL bookings including vacated ones
  const {
    data: bookingsData,
    loadQuery: loadBookings,
    loadUpdate: loadUpdateBooking,
    isLoading: isLoadingBookings,
    error: bookingsError
  } = useReduxApiData({
    table: bookingsEndpoint,
    uniqueKey: "bookings",
    queryType: 'gets',
    mainParam: { 
      is_booked: 1,
      is_vacated: 0,
      location_id
    },
    narration: 'get all bookings'
  });

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
    loadBookings();
    loadClients();
  }, []);

  // Update search results when data changes
  useEffect(() => {
    if (searchResultsData) {
      setSearchResults(searchResultsData);
    }
  }, [searchResultsData]);

  // ==================== SEARCH FUNCTIONS ====================

  const handleSearch = async (): Promise<void> => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    loadClientSearch({ search_term: searchTerm, cat: 'searchClients' });
  };

  // ==================== CLIENT MANAGEMENT ====================

  const handleClientSelect = (client: Client): void => {
    storeTitleRow(client, 1);
    nav(`/bookings/booking/${client.id}`);
  };

  const handleAddClient = async (): Promise<void> => {
    if (!clientForm.name || !clientForm.phone) {
      showToast('Please fill in all required fields (Name and Phone)', 'warning');
      return;
    }

    try {
      const newClient: Client = {
        id: null,
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email,
        company_id: clientForm.company_id || undefined,
        company_name: clientForm.company_name,
        cat: "insert",
        table: "clients",
        narration: "ADD CLIENT"
      };
      await loadUpdateClient(newClient);
      setShowAddClientModal(false);
      setClientForm({
        name: '',
        phone: '',
        email: '',
        company_id: '',
        company_name: '',
      });
      loadClients();
      showToast('Client added successfully!', 'success');
    } catch (error) {
      console.error('Error adding client:', error);
      showToast('Failed to add client. Please try again.', 'error');
    }
  };

  const handleAddCompany = async (): Promise<void> => {
    if (!companyForm.name) {
      showToast('Please enter a company name', 'warning');
      return;
    }

    try {
      const newCompany: Company = {
        id: null,
        name: companyForm.name,
        code: companyForm.code,
        address: companyForm.address,
        phone: companyForm.phone,
        email: companyForm.email,
        cat: "insert",
        table: "companies",
        narration: "Add company"
      };
      await loadUpdateCompanies(newCompany);
      setShowAddCompanyModal(false);
      setCompanyForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: ''
      });
      loadCompanies();
      showToast('Company added successfully!', 'success');
    } catch (error) {
      console.error('Error adding company:', error);
      showToast('Failed to add company. Please try again.', 'error');
    }
  };

  // ==================== BOOKING STATUS MANAGEMENT ====================

  const handleLodgeBooking = async (booking: Booking): Promise<void> => {
    const confirmed = await showConfirmDialog(
      'Confirm Lodge',
      `Are you sure you want to mark this booking as LODGED for ${booking.client_name}?`,
      'Yes, Lodge it!'
    );
    if (!confirmed) return;
    
    try {
      const updateData = {
        id: booking.id,
        is_lodged: 1,
        cat: "insert",
        table: "bookings",
        narration: "Mark as Lodged"
      };
      await loadUpdateBooking(updateData);
      loadBookings();
      showToast(`Booking marked as Lodged for ${booking.client_name}!`, 'success');
    } catch (error) {
      console.error('Error lodging booking:', error);
      showToast('Failed to mark as Lodged. Please try again.', 'error');
    }
  };

  const handleVacateBooking = async (booking: Booking): Promise<void> => {
    const confirmed = await showConfirmDialog(
      'Confirm Vacate',
      `Are you sure you want to mark this booking as VACATED for ${booking.client_name}?`,
      'Yes, Vacate it!'
    );
    if (!confirmed) return;
    
    try {
      const updateData = {
        id: booking.id,
        is_vacated: 1,
        is_booked: 1,
        cat: "insert",
        table: "bookings",
        narration: "Mark as Vacated"
      };
      await loadUpdateBooking(updateData);
      loadBookings();
      showToast(`Booking marked as Vacated for ${booking.client_name}!`, 'success');
    } catch (error) {
      console.error('Error vacating booking:', error);
      showToast('Failed to mark as Vacated. Please try again.', 'error');
    }
  };

  const handleCancelBooking = async (booking: Booking): Promise<void> => {
    const confirmed = await showConfirmDialog(
      '⚠️ Confirm Cancellation',
      `Are you sure you want to CANCEL this booking for ${booking.client_name}? This action cannot be undone.`,
      'Yes, Cancel it!'
    );
    if (!confirmed) return;
    
    try {
      const updateData = {
        id: booking.id,
        act: 3,
        cat: "insert",
        table: "bookings",
        narration: "Cancel Booking"
      };
      await loadUpdateBooking(updateData);
      loadBookings();
      showToast(`Booking cancelled for ${booking.client_name}!`, 'success');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast('Failed to cancel booking. Please try again.', 'error');
    }
  };

  // ==================== CLIENT DETAILS ====================

  const getClientBookings = (clientId: number | string): Booking[] => {
    if (!bookingsData || !bookingsData.length) return [];
    return bookingsData.filter((booking: Booking) => 
      booking.client_id === parseInt(clientId.toString()) && booking.is_booked === 1
    );
  };

  const getClientBookingStats = (clientId: number | string) => {
    const bookings = getClientBookings(clientId);
    const active = bookings.filter(b => b.is_vacated === 0);
    const lodged = bookings.filter(b => b.is_lodged === 1 && b.is_vacated === 0);
    const vacated = bookings.filter(b => b.is_vacated === 1);
    
    return {
      total: bookings.length,
      active: active.length,
      lodged: lodged.length,
      vacated: vacated.length
    };
  };

  const getClientRooms = (clientId: number | string): string[] => {
    const bookings = getClientBookings(clientId);
    const rooms = bookings.map(b => b.room_name);
    return [...new Set(rooms)];
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderClientRow = (client: Client): React.ReactNode => {
    const stats = getClientBookingStats(client.id);
    const rooms = getClientRooms(client.id);
    const bookings = getClientBookings(client.id);
    const today = new Date().toISOString().split('T')[0];
    
    return (
      <tr 
        key={client.id}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
      >
        {/* Client Name */}
        <td className="px-4 py-3">
          <div className="font-medium text-gray-800 dark:text-gray-200">{client.name}</div>
          {client.company_name && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full inline-block mt-1">
              {client.company_name}
            </span>
          )}
        </td>
        
        {/* Phone */}
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          {client.phone}
        </td>
        
        {/* Email */}
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          {client.email || '-'}
        </td>
        
        {/* Booking Stats */}
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
              📚 {stats.total}
            </span>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
              ✅ {stats.active}
            </span>
            {stats.lodged > 0 && (
              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                🏠 {stats.lodged}
              </span>
            )}
            {stats.vacated > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                🚪 {stats.vacated}
              </span>
            )}
          </div>
        </td>
        
        {/* Rooms */}
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {rooms.length > 0 ? (
              rooms.map((room, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  {room}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </div>
        </td>
        
        {/* Bookings Detail with Actions */}
        <td className="px-4 py-3">
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {bookings.length > 0 ? (
              bookings.slice(0, 3).map((booking) => {
                const isPast = booking.date < today;
                const isLodged = booking.is_lodged === 1;
                const isVacated = booking.is_vacated === 1;
                const isBooked = booking.is_booked === 1;
                
                return (
                  <div key={booking.id} className="flex items-center gap-1 text-xs flex-wrap">
                    <span className="text-gray-600 dark:text-gray-400">{booking.room_name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                      isVacated ? 'bg-gray-500 text-white' : 
                      isLodged ? 'bg-yellow-500 text-white' : 
                      'bg-blue-500 text-white'
                    }`}>
                      {isVacated ? 'V' : isLodged ? 'L' : 'B'}
                    </span>
                    <span className="text-gray-400 text-[8px]">{booking.date}</span>
                    
                    {/* Action buttons for past dates */}
                    {isPast && isBooked && (
                      <span className="flex gap-1 ml-1">
                        {!isVacated && !isLodged && (
                          <button
                            onClick={() => handleLodgeBooking(booking)}
                            className="px-1.5 py-0.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-[8px] transition-colors"
                          >
                            Lodge
                          </button>
                        )}
                        {isLodged && !isVacated && (
                          <button
                            onClick={() => handleVacateBooking(booking)}
                            className="px-1.5 py-0.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-[8px] transition-colors"
                          >
                            Vacate
                          </button>
                        )}
                        {!isVacated && (
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            className="px-1.5 py-0.5 bg-red-500 hover:bg-red-600 text-white rounded text-[8px] transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </span>
                    )}
                    
                    {/* Show status if already vacated */}
                    {isVacated && (
                      <span className="text-[8px] text-green-500 ml-1">✓ Done</span>
                    )}
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-gray-400">No bookings</span>
            )}
            {bookings.length > 3 && (
              <span className="text-xs text-gray-400">+{bookings.length - 3} more</span>
            )}
          </div>
        </td>
        
        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedClient(client);
                setShowClientDetails(true);
              }}
              className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
              title="View Details"
            >
              👁️
            </button>
            <button
              onClick={() => handleClientSelect(client)}
              className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors"
              title="Select Client"
            >
              ➜
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderSearchResultRow = (client: Client): React.ReactNode => {
    return (
      <tr 
        key={client.id}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
      >
        <td className="px-4 py-3">
          <div className="font-medium text-gray-800 dark:text-gray-200">{client.name}</div>
          {client.company_name && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full inline-block mt-1">
              {client.company_name}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          {client.phone}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          {client.email || '-'}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={() => handleClientSelect(client)}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors"
          >
            Select
          </button>
        </td>
      </tr>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Toast Container - React Hot Toast */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'custom-toast',
          style: {
            borderRadius: '12px',
            padding: '16px 20px',
            fontWeight: '500',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          },
        }}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            👤 Client Management
          </h1>
          
          <div className="flex items-center gap-3 flex-wrap">
            {allowAddCompany && (
              <button
                onClick={() => setShowAddCompanyModal(true)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
              >
                + Add Company
              </button>
            )}
            {allowAddClient && (
              <button
                onClick={() => setShowAddClientModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                + Add Client
              </button>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search clients by name, phone, email, or company..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value === '') {
                      setSearchResults([]);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 text-sm"
              >
                {isSearching ? 'Searching...' : '🔍 Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Table - Simple view */}
        {searchResults && searchResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Results ({searchResults.length})
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(client => renderSearchResultRow(client))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Clients Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              📋 All Clients with Bookings
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {clientsData?.length || 0} clients
            </span>
          </div>

          {isLoadingClients || isLoadingBookings ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="mt-4 text-gray-600 dark:text-gray-400">Loading clients...</div>
              </div>
            </div>
          ) : clientsError || bookingsError ? (
            <div className="text-center text-red-500 dark:text-red-400 py-12">
              Error loading clients. Please try again.
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Stats</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Rooms</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Bookings</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsData && Array.isArray(bookingsData) && bookingsData.length > 0 ? (
                      // Get unique clients from bookings
                      (() => {
                        const uniqueClients = new Map();
                        bookingsData.forEach((booking: Booking) => {
                          if (booking.is_booked === 1 && !uniqueClients.has(booking.client_id)) {
                            uniqueClients.set(booking.client_id, {
                              id: booking.client_id,
                              name: booking.client_name,
                              phone: booking.client_phone,
                              email: booking.client_email,
                              company_name: booking.company_name
                            });
                          }
                        });
                        return Array.from(uniqueClients.values()).map((client: Client) => renderClientRow(client));
                      })()
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-gray-500 dark:text-gray-400 py-12">
                          No clients found with bookings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Client Modal */}
        {showAddClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Client</h2>
                <button
                  onClick={() => setShowAddClientModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={clientForm.name}
                    onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={clientForm.company_id}
                      onChange={(e) => {
                        const company = companies.find(c => c.id.toString() === e.target.value);
                        setClientForm(prev => ({
                          ...prev,
                          company_id: e.target.value,
                          company_name: company?.name || ''
                        }));
                      }}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                    >
                      <option value="">Select company (optional)</option>
                      {companies && companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {allowAddCompany && (
                      <button
                        onClick={() => setShowAddCompanyModal(true)}
                        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      >
                        + New
                      </button>
                    )}
                  </div>
                </div>

                {!clientForm.company_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name (Custom)
                    </label>
                    <input
                      type="text"
                      value={clientForm.company_name}
                      onChange={(e) => setClientForm(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Enter company name"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Company Modal */}
        {showAddCompanyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Company</h2>
                <button
                  onClick={() => setShowAddCompanyModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter company name"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Code
                  </label>
                  <input
                    type="text"
                    value={companyForm.code}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter company code"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter company address"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter company phone"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter company email"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompany}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  Add Company
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Details Modal */}
        {showClientDetails && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Client Details</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View client information and booking history</p>
                </div>
                <button
                  onClick={() => setShowClientDetails(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {/* Client Info */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{selectedClient.name}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="text-gray-600 dark:text-gray-400">📱 {selectedClient.phone}</div>
                    {selectedClient.email && <div className="text-gray-600 dark:text-gray-400">✉️ {selectedClient.email}</div>}
                    {selectedClient.company_name && (
                      <div className="text-gray-600 dark:text-gray-400">🏢 {selectedClient.company_name}</div>
                    )}
                  </div>
                </div>

                {/* Booking History */}
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">📚 Booking History</h4>
                {isLoadingBookings ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading bookings...</div>
                ) : (
                  <div className="space-y-3">
                    {getClientBookings(selectedClient.id).length > 0 ? (
                      getClientBookings(selectedClient.id).map((booking: Booking) => {
                        const today = new Date().toISOString().split('T')[0];
                        const isPast = booking.date < today;
                        const isLodged = booking.is_lodged === 1;
                        const isVacated = booking.is_vacated === 1;
                        
                        return (
                          <div 
                            key={booking.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 flex-wrap gap-2"
                          >
                            <div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">{booking.room_name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{booking.date}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isVacated ? 'bg-gray-500 text-white' : 
                                isLodged ? 'bg-yellow-500 text-white' : 
                                'bg-blue-500 text-white'
                              }`}>
                                {isVacated ? 'Vacated' : isLodged ? 'Lodged' : 'Booked'}
                              </span>
                              
                              {/* Lodge/Vacate/Cancel buttons for past dates */}
                              {isPast && !isVacated && (
                                <>
                                  {!isLodged ? (
                                    <button
                                      onClick={() => handleLodgeBooking(booking)}
                                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs transition-colors"
                                    >
                                      Lodge
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleVacateBooking(booking)}
                                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                                    >
                                      Vacate
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCancelBooking(booking)}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              
                              {isVacated && (
                                <span className="text-xs text-green-500">✓ Completed</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No bookings found for this client.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => setShowClientDetails(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleClientSelect(selectedClient);
                    setShowClientDetails(false);
                  }}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Select Client
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}