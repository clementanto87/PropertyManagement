import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { tenant } from '../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday, isPast, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

export function AmenitiesPage() {
    const { t } = useTranslation();
    const [amenities, setAmenities] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const fetchData = async () => {
        try {
            const [amenitiesData, bookingsData] = await Promise.all([
                tenant.getAmenities(),
                tenant.getBookings()
            ]);
            setAmenities(amenitiesData.data);
            setMyBookings(bookingsData.data);
        } catch (error) {
            console.error('Failed to fetch amenities data', error);
            toast.error('Failed to load amenities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBook = async () => {
        if (!selectedAmenity || !selectedDate || !selectedTime) {
            toast.error(t('common.error'));
            return;
        }

        setBookingLoading(true);
        try {
            // Parse time string (e.g., "9:00 AM") and combine with selected date
            const [time, period] = selectedTime.split(' ');
            const [hours, minutes] = time.split(':');
            let hour24 = parseInt(hours);
            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;

            const startTime = new Date(selectedDate);
            startTime.setHours(hour24, parseInt(minutes), 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 1); // 1 hour booking

            await tenant.createBooking({
                amenityId: selectedAmenity,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            });

            toast.success(t('amenities.bookingConfirmed'), {
                description: t('amenities.bookedFor', { 
                    name: amenities.find(a => a.id === selectedAmenity)?.name,
                    date: format(startTime, 'MMM d, yyyy'),
                    time: selectedTime
                })
            });
            
            setSelectedAmenity(null);
            setSelectedDate(null);
            setSelectedTime('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('common.error'));
        } finally {
            setBookingLoading(false);
        }
    };

    // Generate date options for the next 14 days
    const getDateOptions = () => {
        const dates = [];
        const today = startOfDay(new Date());
        for (let i = 0; i < 14; i++) {
            const date = addDays(today, i);
            dates.push(date);
        }
        return dates;
    };

    const timeSlots = [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
    ];

    const selectedAmenityData = amenities.find(a => a.id === selectedAmenity);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="space-y-8 animate-in fade-in duration-500"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('amenities.title')}</h1>
                <p className="text-muted-foreground dark:text-gray-400 mt-1">{t('amenities.subtitle')}</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Amenities List */}
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {amenities.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-muted-foreground dark:text-gray-400">
                                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                                <p>{t('amenities.noAmenities')}</p>
                            </div>
                        ) : (
                            amenities.map((amenity) => (
                                <motion.div
                                    key={amenity.id}
                                    variants={item}
                                >
                                    <Card
                                        className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                                            selectedAmenity === amenity.id 
                                                ? 'ring-2 ring-blue-500 shadow-lg' 
                                                : 'hover:border-blue-300'
                                        }`}
                                        onClick={() => {
                                            setSelectedAmenity(amenity.id);
                                            setSelectedDate(null);
                                            setSelectedTime('');
                                        }}
                                    >
                                        <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                                            <div className="w-full h-full flex items-center justify-center">
                                                <CalendarIcon className="h-16 w-16 text-blue-400 opacity-50" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                                <h3 className="text-white font-bold text-lg">{amenity.name}</h3>
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-1" /> {t('amenities.maxCapacity', { capacity: amenity.maxCapacity || 'N/A' })}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2">{amenity.description || t('amenities.noDescription')}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Booking Section (Visible when amenity selected) */}
                    {selectedAmenity && selectedAmenityData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl dark:text-gray-100">{t('amenities.book', { name: selectedAmenityData.name })}</CardTitle>
                                            <CardDescription className="dark:text-gray-400">{t('amenities.selectDateTime')}</CardDescription>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedAmenity(null);
                                                setSelectedDate(null);
                                                setSelectedTime('');
                                            }}
                                            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                                        >
                                            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('amenities.selectDate')}</label>
                                        <div className="grid grid-cols-7 gap-2">
                                            {getDateOptions().map((date) => {
                                                const isSelected = selectedDate && isSameDay(date, selectedDate);
                                                const isDateToday = isToday(date);
                                                const isDatePast = isPast(date) && !isToday(date);
                                                
                                                return (
                                                    <button
                                                        key={date.toISOString()}
                                                        type="button"
                                                        onClick={() => !isDatePast && setSelectedDate(date)}
                                                        disabled={isDatePast}
                                                        className={`p-3 rounded-lg text-center text-sm font-medium transition-all ${
                                                            isSelected
                                                                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-105'
                                                                : isDatePast
                                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                                : isDateToday
                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/40'
                                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                        }`}
                                                    >
                                                        <div className="text-xs opacity-75">
                                                            {format(date, 'EEE')}
                                                        </div>
                                                        <div className="text-lg font-bold">
                                                            {format(date, 'd')}
                                                        </div>
                                                    {isDateToday && (
                                                        <div className="text-[10px] mt-1">{t('amenities.today')}</div>
                                                    )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {selectedDate && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                {t('amenities.availableTimes', { date: format(selectedDate, 'EEEE, MMMM d') })}
                                            </label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                {timeSlots.map((time) => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                                                            selectedTime === time
                                                                ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md scale-105'
                                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                        }`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        disabled={!selectedDate || !selectedTime || bookingLoading}
                                        onClick={handleBook}
                                    >
                                        {bookingLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t('amenities.booking')}
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                {t('amenities.confirmBooking')}
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>

                {/* Sidebar - My Bookings */}
                <motion.div variants={item} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-blue-600" />
                                {t('amenities.myBookings')}
                            </CardTitle>
                            <CardDescription>{t('amenities.upcomingReservations', { count: myBookings.length })}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {myBookings.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>{t('amenities.noBookings')}</p>
                                    <p className="text-xs mt-1">{t('amenities.selectAmenity')}</p>
                                </div>
                            ) : (
                                myBookings.map((booking) => {
                                    const bookingDate = new Date(booking.startTime);
                                    const isUpcoming = bookingDate > new Date();
                                    
                                    return (
                                        <motion.div
                                            key={booking.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                                                isUpcoming
                                                    ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                                                    : 'bg-gray-50 border-gray-100 opacity-75'
                                            }`}
                                        >
                                            <div className="p-2 bg-blue-100 rounded-lg border border-blue-200 flex-shrink-0">
                                                <CalendarIcon className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{booking.amenity?.name || 'Unknown Amenity'}</p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {format(bookingDate, 'MMM d, yyyy')} • {format(bookingDate, 'h:mm a')}
                                                </p>
                                                <div className="mt-2 flex items-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                                                        booking.status === 'CONFIRMED' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : booking.status === 'PENDING'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {booking.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
