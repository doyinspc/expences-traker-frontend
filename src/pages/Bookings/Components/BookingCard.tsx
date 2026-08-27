import React, { useState, useEffect, useMemo } from 'react';
import useReduxApiData from '../../../hooks/useTanstackQuery';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

// ==================== TYPES ====================

export interface Client {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  company_id?: string;
}

export interface Room {
  id: number;
  parent_id: number;
  code: string;
  name: string;
  is_active: number;
  children?: Room[];
}

export interface RoomCategory {
  id: number;
  parent_id: number;
  code: string;
  name: string;
  is_active: number;
  children: Room[];
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
  is_booked: 0 | 1;
  is_lodged: 0 | 1;
  is_vacated: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
}

export type BookingStatus = 'available' | 'booked' | 'lodged' | 'vacated' | 'selected';

// ==================== PROPS ====================

interface BookingCardProps {
  client_id: number;
  clientData: {
    id: number;
    name: string;
    phone: string;
    email: string;
    company_id?: string;
  };
  roomsEndpoint?: string;
  bookingsEndpoint?: string;
  groupId?: number;
  onBookingCreated?: (bookings: Partial<Booking>[]) => void;
  onBookingCancelled?: (bookingId: number) => void;
  onBookingStatusUpdated?: (bookingId: number, status: keyof Pick<Booking, 'is_lodged' | 'is_vacated'>) => void;
  initialDate?: Date;
  visibleDays?: number;
  allowMultiDayBooking?: boolean;
  renderRoomCard?: (room: Room, date: Date, status: BookingStatus, booking?: Booking) => React.ReactNode;
  renderCategoryHeader?: (category: RoomCategory) => React.ReactNode;
  showSubmitButton?: boolean;
  renderSubmitButton?: (props: {
    selectedDays: Date[];
    isSubmitting: boolean;
    onSubmit: () => void;
    onCancel: () => void;
  }) => React.ReactNode;
}

// ==================== TOAST ====================

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// ==================== UTILITY FUNCTIONS ====================

const getBookingStatus = (booking?: Booking): BookingStatus => {
  if (!booking) return 'available';
  if (booking.is_vacated === 1) return 'vacated';
  if (booking.is_lodged === 1) return 'lodged';
  return 'booked';
};

const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case 'available':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'booked':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'lodged':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'vacated':
      return 'bg-gray-500 hover:bg-gray-600 text-white';
    case 'selected':
      return 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-300 ring-offset-2 dark:ring-offset-gray-800';
    default:
      return 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
};

const getStatusLabel = (status: BookingStatus): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'booked':
      return 'Booked';
    case 'lodged':
      return 'Lodged';
    case 'vacated':
      return 'Vacated';
    case 'selected':
      return 'Selected';
    default:
      return 'Unknown';
  }
};

const getStatusIcon = (status: BookingStatus): string => {
  switch (status) {
    case 'available':
      return 'A';
    case 'booked':
      return 'B';
    case 'lodged':
      return 'L';
    case 'vacated':
      return 'V';
    case 'selected':
      return '✓';
    default:
      return '?';
  }
};

// ==================== COMPONENT ====================

export default function BookingCard({
  client_id,
  clientData,
  roomsEndpoint = "commons",
  bookingsEndpoint = "bookings",
  groupId = 31,
  onBookingCreated,
  onBookingCancelled,
  onBookingStatusUpdated,
  initialDate = new Date(),
  visibleDays = 30,
  allowMultiDayBooking = true,
  renderRoomCard,
  renderCategoryHeader,
  showSubmitButton = true,
  renderSubmitButton,
}: BookingCardProps) {
  // ==================== STATE DEFINITIONS ====================
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDaysPerRoom, setSelectedDaysPerRoom] = useState<Record<number, Date[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [monthDays, setMonthDays] = useState<DayData[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusUpdateBooking, setStatusUpdateBooking] = useState<Booking | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const {location_id} = useSelector(state => state.auth)

  const nav = useNavigate();

  // Toast auto-dismiss
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // ==================== TOAST FUNCTIONS ====================

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const renderToast = (toast: Toast) => {
    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    };

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return (
      <div
        key={toast.id}
        className={`${colors[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-md animate-slide-in`}
      >
        <span className="text-lg">{icons[toast.type]}</span>
        <span className="flex-1 text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => removeToast(toast.id)}
          className="text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    );
  };

  // Generate month days
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: DayData[] = [];
    
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      const date = new Date(year, month, -startPadding + i + 1);
      days.push({ date, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    const endPadding = 6 - lastDay.getDay();
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    setMonthDays(days);
  }, [currentMonth]);

  // Fetch rooms data
  const {
    data: roomsData,
    loadQuery: loadRooms,
    isLoading: isLoadingRooms,
    error: roomsError
  } = useReduxApiData({
    table: roomsEndpoint,
    uniqueKey: "common",
    queryType: 'getRowsWithChildrenStructured',
    mainParam: { grp: groupId, is_active: 1,  item_id1:location_id },
    narration: 'get all rooms categories and rooms items in a structured manner'
  });

  // Fetch bookings data for the entire month
  const monthStart = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  }, [currentMonth]);

  const monthEnd = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  }, [currentMonth]);

  const {
    data: bookingData,
    loadQuery: loadBookings,
    loadUpdate,
    isLoading: isLoadingBooking,
    error: bookingError
  } = useReduxApiData({
    table: bookingsEndpoint,
    uniqueKey: "booking",
    queryType: 'gets',
    mainParam: { 
      start_date: monthStart.toISOString().split('T')[0],
      end_date: monthEnd.toISOString().split('T')[0]
    },
    narration: 'get all bookings for month'
  });

  // ==================== UTILITY FUNCTIONS ====================

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const navigateMonth = (direction: number): void => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const getBookingsForRoomAndDate = (roomId: number, date: Date): Booking[] => {
    if (!bookingData || !bookingData.length) return [];
    const dateStr = formatDate(date);
    return bookingData.filter((booking: Booking) => 
      booking.room_id === roomId && booking.date === dateStr
    );
  };

  const getBookingForRoomAndDate = (roomId: number, date: Date): Booking | null => {
    const bookings = getBookingsForRoomAndDate(roomId, date);
    return bookings.length > 0 ? bookings[0] : null;
  };

  const getRoomStatusForDate = (roomId: number, date: Date): BookingStatus => {
    const booking = getBookingForRoomAndDate(roomId, date);
    return getBookingStatus(booking);
  };

  const toggleCategory = (categoryId: number): void => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // ==================== DAY SELECTION PER ROOM ====================

  const toggleDaySelection = (roomId: number, date: Date): void => {
    const currentSelectedDays = selectedDaysPerRoom[roomId] || [];
    
    if (!allowMultiDayBooking && currentSelectedDays.length > 0 && !isDaySelectedForRoom(roomId, date)) {
      showToast('Multi-day booking is not allowed. Please select only one day.', 'warning');
      return;
    }

    const booking = getBookingForRoomAndDate(roomId, date);
    if (booking) {
      showToast('This day is already booked. Please select another day.', 'warning');
      return;
    }
    
    const dateStr = formatDate(date);
    setSelectedDaysPerRoom(prev => {
      const current = prev[roomId] || [];
      const exists = current.some(d => formatDate(d) === dateStr);
      
      let newDays;
      if (exists) {
        newDays = current.filter(d => formatDate(d) !== dateStr);
      } else {
        newDays = [...current, date];
      }
      
      return {
        ...prev,
        [roomId]: newDays
      };
    });
  };

  const isDaySelectedForRoom = (roomId: number, date: Date): boolean => {
    const days = selectedDaysPerRoom[roomId] || [];
    return days.some(d => formatDate(d) === formatDate(date));
  };

  const clearSelectedDaysForRoom = (roomId: number): void => {
    setSelectedDaysPerRoom(prev => {
      const newState = { ...prev };
      delete newState[roomId];
      return newState;
    });
  };

  // ==================== ROOM HANDLING ====================

  const handleRoomClick = (room: Room, date: Date): void => {
    const booking = getBookingForRoomAndDate(room.id, date);
    
    if (booking) {
      setSelectedBooking(booking);
      setShowDetailsModal(true);
    } else {
      setSelectedRoom(room);
      clearSelectedDaysForRoom(room.id);
      setShowModal(true);
    }
  };

  // ==================== BOOKING SUBMISSION ====================

  const handleSubmitBooking = async (): Promise<void> => {
    if (!selectedRoom) {
      showToast('No room selected.', 'warning');
      return;
    }
    
    const selectedDays = selectedDaysPerRoom[selectedRoom.id] || [];
    
    if (selectedDays.length === 0) {
      showToast('Please select at least one day for booking.', 'warning');
      return;
    }

    setIsSubmitting(true);

    const bookings: Partial<Booking>[] = selectedDays.map(date => ({
      room_id: selectedRoom!.id,
      room_parent_id: selectedRoom!.parent_id,
      date: formatDate(date),
      client_id: client_id,
      is_booked: 1,
      is_lodged: 0,
      is_vacated: 0
    }));

    try {
      console.log('Creating bookings:', bookings);
      
      for (const booking of bookings) {
        await loadUpdate(booking);
      }
      
      if (onBookingCreated) {
        await onBookingCreated(bookings);
      }
      
      showToast(`✅ Booking created successfully for ${bookings.length} day(s)!`, 'success');
      setShowModal(false);
      setSelectedRoom(null);
      if (selectedRoom) {
        clearSelectedDaysForRoom(selectedRoom.id);
      }
      loadBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      showToast('❌ Failed to create booking. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== BOOKING STATUS MANAGEMENT ====================

  const handleUpdateBookingStatus = async (
    booking: Booking,
    statusKey: 'is_lodged' | 'is_vacated'
  ): Promise<void> => {
    const action = statusKey === 'is_lodged' ? 'lodge' : 'vacate';
    const confirmMessage = `Are you sure you want to ${action} this booking for ${booking.client_name}?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const updatedPayload = {
        id: booking.id,
        [statusKey]: 1,
      };

      await loadUpdate(updatedPayload);

      if (onBookingStatusUpdated) {
        await onBookingStatusUpdated(booking.id, statusKey);
      }

      showToast(`✅ Booking ${action}d successfully!`, 'success');
      setShowStatusModal(false);
      setStatusUpdateBooking(null);
      loadBookings();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      showToast(`❌ Failed to ${action} booking. Please try again.`, 'error');
    }
  };

  const handleCancelBooking = async (bookingId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        console.log('Deleting booking:', bookingId);
        
        if (onBookingCancelled) {
          await onBookingCancelled(bookingId);
        }
        
        showToast('✅ Booking cancelled successfully!', 'success');
        setShowDetailsModal(false);
        loadBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        showToast('❌ Failed to cancel booking. Please try again.', 'error');
      }
    }
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderMiniRoomCard = (room: Room, dayData: DayData): React.ReactNode => {
    const { date, isCurrentMonth } = dayData;
    const status = getRoomStatusForDate(room.id, date);
    const booking = getBookingForRoomAndDate(room.id, date);
    
    if (!isCurrentMonth) {
      return <div className="w-full h-8 sm:h-10 md:h-12 opacity-0"></div>;
    }

    if (renderRoomCard) {
      return renderRoomCard(room, date, status, booking || undefined);
    }
    
    return (
      <div
        key={`${room.id}-${formatDate(date)}`}
        onClick={() => handleRoomClick(room, date)}
        className={`
          w-full h-8 sm:h-10 md:h-12 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105
          flex flex-col items-center justify-center text-xs font-medium
          ${getStatusColor(status)}
          px-0.5
        `}
        title={`${room.name} - ${getStatusLabel(status)}${booking ? ' by ' + booking.client_name : ''}`}
      >
        <span className="text-[10px] sm:text-xs md:text-sm font-bold leading-none">{date.getDate()}</span>
        {booking && (
          <span className="text-[5px] sm:text-[6px] md:text-[7px] truncate max-w-full text-center leading-tight mt-0.5 text-white/90">
            {booking.client_name}
          </span>
        )}
        {!booking && (
          <span className="text-[5px] sm:text-[6px] md:text-[7px] mt-0.5 text-white/80">
            {getStatusIcon(status)}
          </span>
        )}
      </div>
    );
  };

  const renderCompactCategory = (category: RoomCategory): React.ReactNode => {
    const isExpanded = expandedCategories[category.id] || false;
    const rooms = category.children || [];
    
    let bookedCount = 0;
    let lodgedCount = 0;
    let vacatedCount = 0;
    let availableCount = 0;
    
    const monthDaysFiltered = monthDays.filter(d => d.isCurrentMonth);
    
    rooms.forEach(room => {
      monthDaysFiltered.forEach(day => {
        const booking = getBookingForRoomAndDate(room.id, day.date);
        if (booking) {
          if (booking.is_vacated === 1) vacatedCount++;
          else if (booking.is_lodged === 1) lodgedCount++;
          else bookedCount++;
        } else {
          availableCount++;
        }
      });
    });

    const categoryHeader = renderCategoryHeader 
      ? renderCategoryHeader(category)
      : (
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm">
            {category.code}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">{category.name}</h3>
            <div className="flex flex-wrap gap-1 sm:gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400">🟢 {availableCount}</span>
              <span className="text-blue-600 dark:text-blue-400">🔵 {bookedCount}</span>
              <span className="text-yellow-600 dark:text-yellow-400">🟡 {lodgedCount}</span>
              <span className="text-gray-500 dark:text-gray-400">⚪ {vacatedCount}</span>
            </div>
          </div>
        </div>
      );

    return (
      <div key={category.id} className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all">
        <div 
          className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => toggleCategory(category.id)}
        >
          {categoryHeader}
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMonth(-1);
                }}
                className="px-2 sm:px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
              >
                ◀
              </button>
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMonth(1);
                }}
                className="px-2 sm:px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
              >
                ▶
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={index} className="text-center text-[8px] sm:text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {day}
                </div>
              ))}
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 text-[8px] sm:text-[10px] md:text-xs">
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></span>
                Available
              </span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></span>
                Booked
              </span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></span>
                Lodged
              </span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-500"></span>
                Vacated
              </span>
            </div>

            {/* Room Grid */}
            <div className="space-y-1 sm:space-y-1.5">
              {rooms.map(room => (
                <div key={room.id} className="flex items-center gap-1 sm:gap-2 md:gap-3 p-1 sm:p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="w-12 sm:w-16 md:w-24 flex-shrink-0">
                    <div className="font-medium text-[10px] sm:text-xs md:text-sm text-gray-700 dark:text-gray-300 truncate">{room.code}</div>
                    <div className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">{room.name}</div>
                  </div>
                  <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2">
                    {monthDays.map((dayData, index) => (
                      <div key={index} className="flex justify-center w-full">
                        {renderMiniRoomCard(room, dayData)}
                      </div>
                    ))}
                  </div>
                  <div className="w-10 sm:w-12 md:w-16 flex-shrink-0 text-right">
                    <span className="text-[6px] sm:text-[8px] md:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 truncate">
                      {room.code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== LOADING & ERROR STATES ====================

  if (isLoadingRooms || isLoadingBooking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (roomsError || bookingError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-red-500 dark:text-red-400">Error loading data. Please try again.</div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => renderToast(toast))}
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header with Client Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Room Bookings</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Booking for:</span>
              <span className="font-semibold text-gray-200 dark:text-gray-200">{clientData.name}</span>
              <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">|</span>
              <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">📱 {clientData.phone}</span>
              {clientData.email && (
                <>
                  <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">|</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden md:inline">✉️ {clientData.email}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
             <button
              onClick={() => nav(-1)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
            >
              Back
            </button>
            <button
              
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* Month Navigation - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm"
          >
            ◀ Previous Month
          </button>
          <span className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-200 order-first sm:order-none">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm"
          >
            Next Month ▶
          </button>
        </div>

        {/* Room Categories */}
        <div className="space-y-4">
          {roomsData && roomsData.length > 0 ? (
            roomsData.map((category: RoomCategory) => renderCompactCategory(category))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              No room categories found.
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {showModal && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">📅 Book Room</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{selectedRoom.name} ({selectedRoom.code})</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                    👤 {clientData.name} • 📱 {clientData.phone}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRoom(null);
                    if (selectedRoom) {
                      clearSelectedDaysForRoom(selectedRoom.id);
                    }
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl sm:text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {/* Client Info Display */}
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Booking for Client</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">{clientData.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">📱 {clientData.phone}</div>
                  {clientData.email && (
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">✉️ {clientData.email}</div>
                  )}
                </div>

                {/* Day Selection */}
                <div>
                  <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Days
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">
                        {selectedDaysPerRoom[selectedRoom.id]?.length || 0} day(s) selected
                      </span>
                      {selectedDaysPerRoom[selectedRoom.id]?.length > 0 && (
                        <button
                          onClick={() => clearSelectedDaysForRoom(selectedRoom.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {monthDays.filter(d => d.isCurrentMonth).slice(0, visibleDays).map((dayData, index) => {
                      const { date, isCurrentMonth } = dayData;
                      const status = getRoomStatusForDate(selectedRoom.id, date);
                      const booking = getBookingForRoomAndDate(selectedRoom.id, date);
                      const isSelected = isDaySelectedForRoom(selectedRoom.id, date);
                      const isBooked = status !== 'available';
                      
                      return (
                        <div
                          key={index}
                          onClick={() => isCurrentMonth && !isBooked && toggleDaySelection(selectedRoom.id, date)}
                          className={`
                            p-1.5 sm:p-3 rounded-lg text-center cursor-pointer transition-all min-h-[50px] sm:min-h-[70px]
                            ${!isCurrentMonth ? 'opacity-30' : ''}
                            ${isBooked 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 cursor-not-allowed' 
                              : isSelected
                                ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/50'
                                : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40'
                            }
                          `}
                        >
                          <div className="text-[8px] sm:text-xs font-medium text-gray-600 dark:text-gray-300">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                            {date.getDate()}
                          </div>
                          {isBooked && booking && (
                            <div className="mt-0.5 sm:mt-1 text-[6px] sm:text-[10px] leading-tight">
                              <div className="font-medium text-blue-700 dark:text-blue-300 truncate">
                                {booking.client_name}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-[5px] sm:text-[8px] truncate hidden sm:block">
                                📱 {booking.client_phone}
                              </div>
                            </div>
                          )}
                          {isSelected && !isBooked && (
                            <div className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs font-bold text-white">✓ Selected</div>
                          )}
                          {!isBooked && !isSelected && (
                            <div className="mt-0.5 sm:mt-1 text-[5px] sm:text-[8px] text-green-700 dark:text-green-300 hidden sm:block">Available</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedDaysPerRoom[selectedRoom.id]?.length > 0 && (
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">📋 Selected days:</div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedDaysPerRoom[selectedRoom.id].map((date, idx) => (
                          <span key={idx} className="text-[8px] sm:text-xs bg-purple-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              {showSubmitButton && (
                <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  {renderSubmitButton ? (
                    renderSubmitButton({
                      selectedDays: selectedDaysPerRoom[selectedRoom.id] || [],
                      isSubmitting,
                      onSubmit: handleSubmitBooking,
                      onCancel: () => {
                        setShowModal(false);
                        setSelectedRoom(null);
                        if (selectedRoom) {
                          clearSelectedDaysForRoom(selectedRoom.id);
                        }
                      }
                    })
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedRoom && selectedDaysPerRoom[selectedRoom.id]?.length > 0 && (
                        <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          📌 You have selected <span className="font-bold text-purple-600 dark:text-purple-400">{selectedDaysPerRoom[selectedRoom.id].length}</span> day(s)
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <button
                          onClick={() => {
                            setShowModal(false);
                            setSelectedRoom(null);
                            if (selectedRoom) {
                              clearSelectedDaysForRoom(selectedRoom.id);
                            }
                          }}
                          className="px-4 sm:px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitBooking}
                          disabled={!selectedRoom || selectedDaysPerRoom[selectedRoom.id]?.length === 0 || isSubmitting}
                          className={`
                            px-6 sm:px-8 py-2 rounded-lg transition-all font-medium flex items-center justify-center gap-2 text-sm
                            ${selectedRoom && selectedDaysPerRoom[selectedRoom.id]?.length > 0 && !isSubmitting
                              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50' 
                              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'}
                            ${isSubmitting ? 'opacity-75 cursor-wait' : ''}
                          `}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <span>✅ Confirm Booking</span>
                              {selectedRoom && selectedDaysPerRoom[selectedRoom.id]?.length > 0 && (
                                <span className="bg-white/20 px-2 sm:px-3 py-0.5 rounded-full text-xs font-bold">
                                  {selectedDaysPerRoom[selectedRoom.id].length}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">📋 Booking Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl sm:text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Room:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{selectedBooking.room_name}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{selectedBooking.date}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Client:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{selectedBooking.client_name}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{selectedBooking.client_phone}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{selectedBooking.client_email || 'N/A'}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getBookingStatus(selectedBooking))}`}>
                    {getStatusLabel(getBookingStatus(selectedBooking))}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-1.5 sm:py-2 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Company ID:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{selectedBooking.company_id || 'N/A'}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Close
                </button>
                {selectedBooking.is_lodged === 0 && selectedBooking.is_vacated === 0 && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setStatusUpdateBooking(selectedBooking);
                      setShowStatusModal(true);
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
                  >
                    🏠 Lodge
                  </button>
                )}
                {selectedBooking.is_lodged === 1 && selectedBooking.is_vacated === 0 && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setStatusUpdateBooking(selectedBooking);
                      setShowStatusModal(true);
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    🚪 Vacate
                  </button>
                )}
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && statusUpdateBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Update Status</h2>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusUpdateBooking(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl sm:text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
                  Update status for <span className="font-semibold">{statusUpdateBooking.client_name}</span> 
                  {' '} in room <span className="font-semibold">{statusUpdateBooking.room_name}</span> 
                  {' '} on <span className="font-semibold">{statusUpdateBooking.date}</span>
                </p>
                
                <div className="flex flex-col gap-2 sm:gap-3">
                  {statusUpdateBooking.is_lodged === 0 && statusUpdateBooking.is_vacated === 0 && (
                    <button
                      onClick={() => handleUpdateBookingStatus(statusUpdateBooking, 'is_lodged')}
                      className="w-full px-4 py-2.5 sm:py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      🏠 Mark as Lodged
                    </button>
                  )}
                  {statusUpdateBooking.is_lodged === 1 && statusUpdateBooking.is_vacated === 0 && (
                    <button
                      onClick={() => handleUpdateBookingStatus(statusUpdateBooking, 'is_vacated')}
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      🚪 Mark as Vacated
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setStatusUpdateBooking(null);
                    }}
                    className="w-full px-4 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}